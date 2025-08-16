import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { 
  Mail, 
  Send, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Upload,
  Download,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
  createdBy: string;
  lastUsed: string | null;
}

interface ContactList {
  id: string;
  name: string;
  description: string;
  contacts: Contact[];
  createdAt: string;
  createdBy: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'bounced' | 'unsubscribed';
  lastEmail?: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  contactListIds: string[];
  scheduledAt: string | null;
  sentAt: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export function EmailSystem() {
  const [activeTab, setActiveTab] = useState('compose');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [composeEmail, setComposeEmail] = useState({
    to: [] as string[],
    subject: '',
    body: '',
    templateId: '',
    contactListIds: [] as string[],
    scheduledAt: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    variables: [] as string[]
  });

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    setLoading(true);
    try {
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to {{clubName}}!',
          body: 'Dear {{memberName}},\n\nWelcome to our Rotary Club! We are excited to have you join us.\n\nBest regards,\n{{senderName}}',
          variables: ['clubName', 'memberName', 'senderName'],
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
          lastUsed: null
        }
      ];

      const mockContactLists: ContactList[] = [
        {
          id: '1',
          name: 'All Members',
          description: 'Complete list of all club members',
          contacts: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'member',
              tags: ['active'],
              status: 'active'
            }
          ],
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        }
      ];

      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Monthly Newsletter',
          subject: 'Monthly Newsletter - January 2025',
          templateId: '1',
          contactListIds: ['1'],
          scheduledAt: null,
          sentAt: new Date().toISOString(),
          status: 'sent',
          stats: {
            sent: 45,
            delivered: 43,
            opened: 32,
            clicked: 12,
            bounced: 2,
            unsubscribed: 1
          }
        }
      ];

      setTemplates(mockTemplates);
      setContactLists(mockContactLists);
      setCampaigns(mockCampaigns);
    } catch (err) {
      setError('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      setError('Please fill in all required fields');
      return;
    }

    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      variables: newTemplate.variables,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user',
      lastUsed: null
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', subject: '', body: '', variables: [] });
    setIsTemplateDialogOpen(false);
    setSuccess('Template created successfully!');
  };

  const handleSendEmail = async () => {
    if (!composeEmail.subject || !composeEmail.body) {
      setError('Please fill in subject and body');
      return;
    }

    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: composeEmail.subject,
      subject: composeEmail.subject,
      templateId: composeEmail.templateId,
      contactListIds: composeEmail.contactListIds,
      scheduledAt: composeEmail.scheduledAt || null,
      sentAt: composeEmail.scheduledAt ? null : new Date().toISOString(),
      status: composeEmail.scheduledAt ? 'scheduled' : 'sent',
      stats: {
        sent: composeEmail.scheduledAt ? 0 : composeEmail.to.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      }
    };

    setCampaigns([...campaigns, campaign]);
    setSuccess(composeEmail.scheduledAt ? 'Email scheduled successfully!' : 'Email sent successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Communication</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Subject"
                value={composeEmail.subject}
                onChange={(e) => setComposeEmail({...composeEmail, subject: e.target.value})}
              />
              <Textarea
                placeholder="Email body"
                value={composeEmail.body}
                onChange={(e) => setComposeEmail({...composeEmail, body: e.target.value})}
                rows={10}
              />
              <Button onClick={handleSendEmail} disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.stats.sent}</TableCell>
                      <TableCell>{campaign.stats.opened}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Email Templates</h3>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Template Name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                  <Input
                    placeholder="Subject Line"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  />
                  <Textarea
                    placeholder="Email Body"
                    value={newTemplate.body}
                    onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                    rows={8}
                  />
                  <Button onClick={handleCreateTemplate} disabled={loading}>
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">245</div>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">198</div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-sm text-muted-foreground">Opened</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-sm text-muted-foreground">Clicked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
