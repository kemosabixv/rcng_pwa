// @ts-nocheck
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add logger
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify user authorization
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', status: 401 };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Invalid access token', status: 401 };
  }
  
  return { user, status: 200 };
}

// Helper function to check user role
async function checkUserRole(userId: string, requiredRole: string) {
  const userProfile = await kv.get(`user:${userId}`);
  if (!userProfile) {
    return false;
  }
  
  const profile = JSON.parse(userProfile);
  return profile.role === requiredRole || profile.role === 'admin';
}

// ============ AUTHENTICATION ROUTES ============

app.post('/make-server-b2be43be/signup', async (c) => {
  try {
    const { email, password, name, profession, company, phone } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });
    
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile
    const userProfile = {
      id: data.user.id,
      email,
      name,
      profession,
      company,
      phone,
      role: 'member',
      status: 'active',
      joinDate: new Date().toISOString(),
      lastLogin: null,
      permissions: ['member:read']
    };
    
    await kv.set(`user:${data.user.id}`, JSON.stringify(userProfile));
    
    return c.json({ message: 'User created successfully', user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============ MEMBER MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/members', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const members = await kv.getByPrefix('user:');
    const memberList = members.map(member => JSON.parse(member));
    
    return c.json({ members: memberList });
  } catch (error) {
    console.log('Get members error:', error);
    return c.json({ error: 'Failed to fetch members' }, 500);
  }
});

app.put('/make-server-b2be43be/members/:id', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const memberId = c.req.param('id');
    const updates = await c.req.json();
    
    // Check if user has permission to update members
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const existingMember = await kv.get(`user:${memberId}`);
    if (!existingMember) {
      return c.json({ error: 'Member not found' }, 404);
    }
    
    const memberData = JSON.parse(existingMember);
    const updatedMember = { ...memberData, ...updates };
    
    await kv.set(`user:${memberId}`, JSON.stringify(updatedMember));
    
    return c.json({ message: 'Member updated successfully', member: updatedMember });
  } catch (error) {
    console.log('Update member error:', error);
    return c.json({ error: 'Failed to update member' }, 500);
  }
});

// ============ COMMITTEE MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/committees', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const committees = await kv.getByPrefix('committee:');
    const committeeList = committees.map(committee => JSON.parse(committee));
    
    return c.json({ committees: committeeList });
  } catch (error) {
    console.log('Get committees error:', error);
    return c.json({ error: 'Failed to fetch committees' }, 500);
  }
});

app.post('/make-server-b2be43be/committees', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const { name, description, chairperson, members, meetingSchedule, budget } = await c.req.json();
    
    const committeeId = crypto.randomUUID();
    const committee = {
      id: committeeId,
      name,
      description,
      chairperson,
      members: members || [],
      meetingSchedule,
      budget: budget || 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    await kv.set(`committee:${committeeId}`, JSON.stringify(committee));
    
    return c.json({ message: 'Committee created successfully', committee });
  } catch (error) {
    console.log('Create committee error:', error);
    return c.json({ error: 'Failed to create committee' }, 500);
  }
});

// ============ DUES MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/dues', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const dues = await kv.getByPrefix('dues:');
    const duesList = dues.map(due => JSON.parse(due));
    
    return c.json({ dues: duesList });
  } catch (error) {
    console.log('Get dues error:', error);
    return c.json({ error: 'Failed to fetch dues' }, 500);
  }
});

app.post('/make-server-b2be43be/dues', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const { memberId, amount, dueDate, description, type } = await c.req.json();
    
    const dueId = crypto.randomUUID();
    const due = {
      id: dueId,
      memberId,
      amount,
      dueDate,
      description,
      type: type || 'monthly',
      status: 'pending',
      createdAt: new Date().toISOString(),
      paidAt: null
    };
    
    await kv.set(`dues:${dueId}`, JSON.stringify(due));
    
    return c.json({ message: 'Due created successfully', due });
  } catch (error) {
    console.log('Create due error:', error);
    return c.json({ error: 'Failed to create due' }, 500);
  }
});

// ============ PROJECT MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/projects', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const projects = await kv.getByPrefix('project:');
    const projectList = projects.map(project => JSON.parse(project));
    
    return c.json({ projects: projectList });
  } catch (error) {
    console.log('Get projects error:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.post('/make-server-b2be43be/projects', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const { name, description, budget, startDate, endDate, assignedMembers, priority } = await c.req.json();
    
    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      name,
      description,
      budget,
      startDate,
      endDate,
      assignedMembers: assignedMembers || [],
      priority: priority || 'medium',
      status: 'planning',
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id,
      tasks: []
    };
    
    await kv.set(`project:${projectId}`, JSON.stringify(project));
    
    return c.json({ message: 'Project created successfully', project });
  } catch (error) {
    console.log('Create project error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// ============ QUOTATION MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/quotations', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const quotations = await kv.getByPrefix('quotation:');
    const quotationList = quotations.map(quotation => JSON.parse(quotation));
    
    return c.json({ quotations: quotationList });
  } catch (error) {
    console.log('Get quotations error:', error);
    return c.json({ error: 'Failed to fetch quotations' }, 500);
  }
});

app.post('/make-server-b2be43be/quotations', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const { clientName, clientEmail, items, notes, validUntil } = await c.req.json();
    
    const quotationId = crypto.randomUUID();
    const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;
    
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const quotation = {
      id: quotationId,
      quotationNumber,
      clientName,
      clientEmail,
      items,
      notes,
      subtotal,
      tax,
      total,
      status: 'draft',
      validUntil,
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id
    };
    
    await kv.set(`quotation:${quotationId}`, JSON.stringify(quotation));
    
    return c.json({ message: 'Quotation created successfully', quotation });
  } catch (error) {
    console.log('Create quotation error:', error);
    return c.json({ error: 'Failed to create quotation' }, 500);
  }
});

// ============ ANALYTICS ROUTES ============

app.get('/make-server-b2be43be/analytics', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    // Get member statistics
    const members = await kv.getByPrefix('user:');
    const memberCount = members.length;
    const activeMembers = members.filter(m => JSON.parse(m).status === 'active').length;
    
    // Get project statistics
    const projects = await kv.getByPrefix('project:');
    const projectCount = projects.length;
    const activeProjects = projects.filter(p => JSON.parse(p).status === 'active').length;
    
    // Get financial statistics
    const dues = await kv.getByPrefix('dues:');
    const totalDues = dues.reduce((sum, d) => sum + JSON.parse(d).amount, 0);
    const paidDues = dues.filter(d => JSON.parse(d).status === 'paid').reduce((sum, d) => sum + JSON.parse(d).amount, 0);
    
    const analytics = {
      members: {
        total: memberCount,
        active: activeMembers,
        inactive: memberCount - activeMembers
      },
      projects: {
        total: projectCount,
        active: activeProjects,
        completed: projects.filter(p => JSON.parse(p).status === 'completed').length
      },
      financial: {
        totalDues,
        paidDues,
        pendingDues: totalDues - paidDues
      },
      events: {
        total: (await kv.getByPrefix('event:')).length,
        upcoming: (await kv.getByPrefix('event:')).filter(e => new Date(JSON.parse(e).date) > new Date()).length
      }
    };
    
    return c.json({ analytics });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============ DOCUMENT MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/documents', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const documents = await kv.getByPrefix('document:');
    const documentList = documents.map(document => JSON.parse(document));
    
    return c.json({ documents: documentList });
  } catch (error) {
    console.log('Get documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

app.post('/make-server-b2be43be/documents', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const { name, type, category, tags, description, fileUrl, fileSize } = await c.req.json();
    
    const documentId = crypto.randomUUID();
    const document = {
      id: documentId,
      name,
      type,
      category,
      tags: tags || [],
      description,
      fileUrl,
      fileSize,
      uploadedBy: auth.user.id,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      visibility: 'private'
    };
    
    await kv.set(`document:${documentId}`, JSON.stringify(document));
    
    return c.json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.log('Upload document error:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

// ============ EMAIL MANAGEMENT ROUTES ============

app.get('/make-server-b2be43be/email-templates', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const templates = await kv.getByPrefix('email-template:');
    const templateList = templates.map(template => JSON.parse(template));
    
    return c.json({ templates: templateList });
  } catch (error) {
    console.log('Get email templates error:', error);
    return c.json({ error: 'Failed to fetch email templates' }, 500);
  }
});

app.post('/make-server-b2be43be/email-templates', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const hasPermission = await checkUserRole(auth.user.id, 'admin');
    if (!hasPermission) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    
    const { name, subject, body, variables } = await c.req.json();
    
    const templateId = crypto.randomUUID();
    const template = {
      id: templateId,
      name,
      subject,
      body,
      variables: variables || [],
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id
    };
    
    await kv.set(`email-template:${templateId}`, JSON.stringify(template));
    
    return c.json({ message: 'Email template created successfully', template });
  } catch (error) {
    console.log('Create email template error:', error);
    return c.json({ error: 'Failed to create email template' }, 500);
  }
});

// ============ EXISTING ROUTES ============

app.get('/make-server-b2be43be/profile', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const profile = await kv.get(`user:${auth.user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile: JSON.parse(profile) });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.get('/make-server-b2be43be/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    const eventList = events.map(event => JSON.parse(event));
    
    return c.json({ events: eventList });
  } catch (error) {
    console.log('Get events error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.post('/make-server-b2be43be/events', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const { title, description, date, time, location, capacity } = await c.req.json();
    
    const eventId = crypto.randomUUID();
    const event = {
      id: eventId,
      title,
      description,
      date,
      time,
      location,
      capacity,
      attendees: [],
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id
    };
    
    await kv.set(`event:${eventId}`, JSON.stringify(event));
    
    return c.json({ message: 'Event created successfully', event });
  } catch (error) {
    console.log('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

app.get('/make-server-b2be43be/blog-posts', async (c) => {
  try {
    const posts = await kv.getByPrefix('blog-post:');
    const postList = posts.map(post => JSON.parse(post));
    
    return c.json({ posts: postList });
  } catch (error) {
    console.log('Get blog posts error:', error);
    return c.json({ error: 'Failed to fetch blog posts' }, 500);
  }
});

app.post('/make-server-b2be43be/blog-posts', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const { title, content, excerpt, tags, status } = await c.req.json();
    
    const postId = crypto.randomUUID();
    const post = {
      id: postId,
      title,
      content,
      excerpt,
      tags: tags || [],
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id,
      views: 0
    };
    
    await kv.set(`blog-post:${postId}`, JSON.stringify(post));
    
    return c.json({ message: 'Blog post created successfully', post });
  } catch (error) {
    console.log('Create blog post error:', error);
    return c.json({ error: 'Failed to create blog post' }, 500);
  }
});

app.get('/make-server-b2be43be/membership-applications', async (c) => {
  try {
    const auth = await verifyAuth(c.req.raw);
    if (auth.error) {
      return c.json({ error: auth.error }, auth.status);
    }
    
    const applications = await kv.getByPrefix('membership-application:');
    const applicationList = applications.map(app => JSON.parse(app));
    
    return c.json({ applications: applicationList });
  } catch (error) {
    console.log('Get membership applications error:', error);
    return c.json({ error: 'Failed to fetch membership applications' }, 500);
  }
});

app.post('/make-server-b2be43be/membership-applications', async (c) => {
  try {
    const { name, email, phone, profession, company, motivation, references } = await c.req.json();
    
    const applicationId = crypto.randomUUID();
    const application = {
      id: applicationId,
      name,
      email,
      phone,
      profession,
      company,
      motivation,
      references: references || [],
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    await kv.set(`membership-application:${applicationId}`, JSON.stringify(application));
    
    return c.json({ message: 'Membership application submitted successfully', application });
  } catch (error) {
    console.log('Submit membership application error:', error);
    return c.json({ error: 'Failed to submit membership application' }, 500);
  }
});

Deno.serve(app.fetch);