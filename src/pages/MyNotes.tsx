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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag,
  Lock,
  Globe,
  Search
} from 'lucide-react';

interface Note {
  id: string;
  title?: string;
  content?: string;
  plant_id: string;
  tags?: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

const MyNotes = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    plant_id: '',
    tags: '',
    is_private: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_plant_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: t('common.error'),
        description: t('notes.saveError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setFormData({
      title: '',
      content: '',
      plant_id: '',
      tags: '',
      is_private: true
    });
    setSelectedNote(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setFormData({
      title: note.title || '',
      content: note.content || '',
      plant_id: note.plant_id,
      tags: note.tags?.join(', ') || '',
      is_private: note.is_private
    });
    setSelectedNote(note);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const noteData = {
        title: formData.title || null,
        content: formData.content || null,
        plant_id: formData.plant_id,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_private: formData.is_private,
        user_id: user.id
      };

      if (isEditing && selectedNote) {
        const { error } = await supabase
          .from('user_plant_notes')
          .update(noteData)
          .eq('id', selectedNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_plant_notes')
          .insert([noteData]);

        if (error) throw error;
      }

      toast({
        title: t('common.success'),
        description: t('notes.saveSuccess'),
      });
      
      setIsDialogOpen(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: t('common.error'),
        description: t('notes.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_plant_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('notes.deleteSuccess'),
      });
      
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: t('common.error'),
        description: t('notes.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const filteredNotes = notes.filter(note =>
    !searchQuery ||
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.plant_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
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
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <StickyNote className="w-8 h-8" />
              {t('notes.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                {t('notes.createNote')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? t('notes.editNote') : t('notes.createNote')}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Update your note' : 'Create a new note about a medicinal plant'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('notes.noteTitle')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter note title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plant_id">{t('notes.plantName')}</Label>
                  <Input
                    id="plant_id"
                    value={formData.plant_id}
                    onChange={(e) => setFormData({ ...formData, plant_id: e.target.value })}
                    placeholder="e.g., aloe-vera, turmeric, neem"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('notes.noteContent')}</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your observations, experiences, or learnings..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">{t('notes.tags')}</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="healing, skin-care, digestive (comma separated)"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_private"
                    checked={formData.is_private}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                  />
                  <Label htmlFor="is_private" className="flex items-center gap-2">
                    {formData.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    {t('notes.isPrivate')}
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveNote} disabled={saving || !formData.plant_id}>
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
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {note.title || 'Untitled Note'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {note.plant_id}
                        </Badge>
                        {note.is_private ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Globe className="w-3 h-3 text-muted-foreground" />
                        )}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Note</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('notes.deleteConfirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {note.content && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {note.content}
                    </p>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.updated_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <StickyNote className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching notes' : t('notes.noNotes')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : t('notes.createFirstNote')
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                {t('notes.createNote')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotes;