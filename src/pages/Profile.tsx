import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  BookHeart, 
  StickyNote, 
  Trophy, 
  Map, 
  Award,
  Edit,
  Save,
  X
} from 'lucide-react';

interface ProfileData {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  preferred_language?: string;
  created_at?: string;
}

interface UserStats {
  bookmarkedPlants: number;
  notesWritten: number;
  quizzesTaken: number;
  toursCompleted: number;
  badgesEarned: number;
}

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { t, changeLanguage } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData>({});
  const [stats, setStats] = useState<UserStats>({
    bookmarkedPlants: 0,
    notesWritten: 0,
    quizzesTaken: 0,
    toursCompleted: 0,
    badgesEarned: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || {});
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.updateError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const [bookmarks, notes, quizzes, tours, badges] = await Promise.all([
        supabase.from('user_bookmarks').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_plant_notes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_quiz_scores').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_tour_progress').select('id', { count: 'exact' }).eq('user_id', user.id).not('completed_at', 'is', null),
        supabase.from('user_badges').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        bookmarkedPlants: bookmarks.count || 0,
        notesWritten: notes.count || 0,
        quizzesTaken: quizzes.count || 0,
        toursCompleted: tours.count || 0,
        badgesEarned: badges.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await updateProfile(profile);
      
      if (error) throw error;

      // Update language if changed
      if (profile.preferred_language) {
        await changeLanguage(profile.preferred_language);
      }

      toast({
        title: t('common.success'),
        description: t('profile.updateSuccess'),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.updateError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="text-lg">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              {t('profile.editProfile')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('common.loading') : t('common.save')}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('common.profile')}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your profile information' : 'Your profile information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-gradient-garden text-white text-xl">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile.display_name || user?.email}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t('profile.displayName')}</Label>
                    <Input
                      id="displayName"
                      value={profile.display_name || ''}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">{t('profile.username')}</Label>
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">{t('profile.preferredLanguage')}</Label>
                    <Select
                      value={profile.preferred_language || 'en'}
                      onValueChange={(value) => setProfile({ ...profile, preferred_language: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profile.joinedDate')}: {formatDate(profile.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {t('profile.statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookHeart className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('profile.bookmarkedPlants')}</span>
                    </div>
                    <Badge variant="secondary">{stats.bookmarkedPlants}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('profile.notesWritten')}</span>
                    </div>
                    <Badge variant="secondary">{stats.notesWritten}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('profile.quizzesTaken')}</span>
                    </div>
                    <Badge variant="secondary">{stats.quizzesTaken}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('profile.toursCompleted')}</span>
                    </div>
                    <Badge variant="secondary">{stats.toursCompleted}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('profile.badgesEarned')}</span>
                    </div>
                    <Badge variant="secondary">{stats.badgesEarned}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;