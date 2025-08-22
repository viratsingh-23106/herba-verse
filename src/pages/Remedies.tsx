import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  BookHeart, 
  Plus, 
  Edit, 
  Star, 
  Calendar, 
  User,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Globe,
  Lock
} from 'lucide-react';

interface Remedy {
  id: string;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  ingredients?: any;
  preparation_method?: string;
  dosage?: string;
  precautions?: string;
  effectiveness_rating?: number;
  is_public: boolean;
  is_approved: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Remedies = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [publicRemedies, setPublicRemedies] = useState<Remedy[]>([]);
  const [myRemedies, setMyRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title_en: '',
    title_hi: '',
    description_en: '',
    description_hi: '',
    ingredients: '',
    preparation_method: '',
    dosage: '',
    precautions: '',
    effectiveness_rating: 5,
    is_public: true
  });

  useEffect(() => {
    loadPublicRemedies();
    if (user) {
      loadMyRemedies();
    }
  }, [user]);

  const loadPublicRemedies = async () => {
    try {
      const { data, error } = await supabase
        .from('user_remedies')
        .select('*')
        .eq('is_public', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublicRemedies(data || []);
    } catch (error) {
      console.error('Error loading public remedies:', error);
    }
  };

  const loadMyRemedies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_remedies')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMyRemedies(data || []);
    } catch (error) {
      console.error('Error loading my remedies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRemedy = () => {
    setFormData({
      title_en: '',
      title_hi: '',
      description_en: '',
      description_hi: '',
      ingredients: '',
      preparation_method: '',
      dosage: '',
      precautions: '',
      effectiveness_rating: 5,
      is_public: true
    });
    setIsDialogOpen(true);
  };

  const handleSaveRemedy = async () => {
    if (!user) {
      toast({
        title: t('auth.authRequired'),
        description: t('auth.signInToAccess'),
      });
      navigate('/auth');
      return;
    }

    setSaving(true);
    try {
      const remedyData = {
        title_en: formData.title_en,
        title_hi: formData.title_hi || null,
        description_en: formData.description_en || null,
        description_hi: formData.description_hi || null,
        ingredients: formData.ingredients ? JSON.parse(JSON.stringify(formData.ingredients.split(',').map((item: string) => item.trim()))) : null,
        preparation_method: formData.preparation_method || null,
        dosage: formData.dosage || null,
        precautions: formData.precautions || null,
        effectiveness_rating: formData.effectiveness_rating,
        is_public: formData.is_public,
        is_approved: false, // Requires admin approval
        user_id: user.id
      };

      const { error } = await supabase
        .from('user_remedies')
        .insert([remedyData]);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('remedies.saveSuccess'),
      });
      
      setIsDialogOpen(false);
      loadMyRemedies();
      loadPublicRemedies();
    } catch (error) {
      console.error('Error saving remedy:', error);
      toast({
        title: t('common.error'),
        description: t('remedies.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRemedyTitle = (remedy: Remedy) => {
    return language === 'hi' && remedy.title_hi ? remedy.title_hi : remedy.title_en;
  };

  const getRemedyDescription = (remedy: Remedy) => {
    return language === 'hi' && remedy.description_hi ? remedy.description_hi : remedy.description_en;
  };

  const filteredPublicRemedies = publicRemedies.filter(remedy =>
    !searchQuery ||
    remedy.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.title_hi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.description_hi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyRemedies = myRemedies.filter(remedy =>
    !searchQuery ||
    remedy.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.title_hi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    remedy.description_hi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookHeart className="w-8 h-8" />
              {t('remedies.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Community-shared traditional remedies and healing practices
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateRemedy}>
                <Plus className="w-4 h-4 mr-2" />
                {t('remedies.createRemedy')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('remedies.createRemedy')}</DialogTitle>
                <DialogDescription>
                  Share your traditional remedy knowledge with the community
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_en">{t('remedies.remedyTitle')} (English)</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      placeholder="Enter remedy title..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_hi">{t('remedies.remedyTitle')} (हिंदी)</Label>
                    <Input
                      id="title_hi"
                      value={formData.title_hi}
                      onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                      placeholder="उपचार का नाम..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description_en">{t('remedies.description')} (English)</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Describe the remedy and its benefits..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_hi">{t('remedies.description')} (हिंदी)</Label>
                    <Textarea
                      id="description_hi"
                      value={formData.description_hi}
                      onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                      placeholder="उपचार और इसके फायदों का विवरण..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">{t('remedies.ingredients')}</Label>
                  <Input
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="turmeric, honey, ginger (comma separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparation_method">{t('remedies.preparationMethod')}</Label>
                  <Textarea
                    id="preparation_method"
                    value={formData.preparation_method}
                    onChange={(e) => setFormData({ ...formData, preparation_method: e.target.value })}
                    placeholder="Step by step preparation instructions..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">{t('remedies.dosage')}</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 1 teaspoon twice daily"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveness_rating">{t('remedies.effectiveness')} (1-5)</Label>
                    <Input
                      id="effectiveness_rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.effectiveness_rating}
                      onChange={(e) => setFormData({ ...formData, effectiveness_rating: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precautions">{t('remedies.precautions')}</Label>
                  <Textarea
                    id="precautions"
                    value={formData.precautions}
                    onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                    placeholder="Any precautions or contraindications..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label htmlFor="is_public" className="flex items-center gap-2">
                    {formData.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {t('remedies.isPublic')}
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveRemedy} disabled={saving || !formData.title_en}>
                  {saving ? t('common.loading') : t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search remedies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public Remedies</TabsTrigger>
            <TabsTrigger value="my">{t('remedies.myRemedies')}</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-6">
            {filteredPublicRemedies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicRemedies.map((remedy) => (
                  <Card key={remedy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {getRemedyTitle(remedy)}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <div className="flex">{renderStarRating(remedy.effectiveness_rating || 5)}</div>
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('remedies.isApproved')}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {getRemedyDescription(remedy) && (
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {getRemedyDescription(remedy)}
                        </p>
                      )}
                      
                      {remedy.ingredients && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2">{t('remedies.ingredients')}:</h4>
                          <div className="flex flex-wrap gap-1">
                            {(typeof remedy.ingredients === 'string' 
                              ? remedy.ingredients.split(',') 
                              : remedy.ingredients
                            ).map((ingredient: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {ingredient.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(remedy.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Community
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookHeart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('remedies.noRemedies')}</h3>
                <p className="text-muted-foreground">Be the first to share a traditional remedy!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-6">
            {user ? (
              filteredMyRemedies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyRemedies.map((remedy) => (
                    <Card key={remedy.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">
                              {getRemedyTitle(remedy)}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <div className="flex">{renderStarRating(remedy.effectiveness_rating || 5)}</div>
                              {remedy.is_approved ? (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {t('remedies.isApproved')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {t('remedies.approvalPending')}
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {getRemedyDescription(remedy) && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                            {getRemedyDescription(remedy)}
                          </p>
                        )}
                        
                        <Separator className="my-3" />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(remedy.updated_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            {remedy.is_public ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            {remedy.is_public ? 'Public' : 'Private'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookHeart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('remedies.noRemedies')}</h3>
                  <p className="text-muted-foreground mb-6">{t('remedies.createFirstRemedy')}</p>
                  <Button onClick={handleCreateRemedy}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('remedies.createRemedy')}
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <BookHeart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('auth.authRequired')}</h3>
                <p className="text-muted-foreground mb-6">{t('auth.signInToAccess')}</p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Remedies;