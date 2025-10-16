'use client';

import React, { useState } from 'react';
import EisenhowerMatrix from '@/components/EisenhowerMatrix';
import TaskTable from '@/components/TaskTable';
import CalendarView from '@/components/CalendarView';
import TaskDetailModal from '@/components/TaskDetailModal';
import AddTaskModal from '@/components/AddTaskModal';
import HealthDashboard from '@/components/HealthDashboard';
import JournalDashboard from '@/components/JournalDashboard';
import { Task, TaskPriority, Project, getFlagsFromPriority } from '@/types/task';
import { Squares2X2Icon, TableCellsIcon, CalendarIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

// Project definitions
const projects: Project[] = [
  { id: 'personal', name: 'Personal', slug: 'personal', color: '#6366f1', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn', name: 'BMN', slug: 'bmn', color: '#10b981', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'csuite', name: 'CSuite', slug: 'csuite', color: '#dc2626', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'health', name: 'Health', slug: 'health', color: '#f59e0b', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'journaling', name: 'Journaling', slug: 'journaling', color: '#8b5cf6', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Personal tasks from CSV - ALL set to 'todo' status as requested (no due dates)
const personalTasks: Task[] = [
  { id: 'p1', project_id: 'personal', title: 'PnL sheet', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p2', project_id: 'personal', title: 'Legal notice to builder indiabulls', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p3', project_id: 'personal', title: 'Company clouser', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p4', project_id: 'personal', title: 'Increase card limit sbi', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p5', project_id: 'personal', title: 'Workout routine', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p6', project_id: 'personal', title: 'Learn SEO and pSEO', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p7', project_id: 'personal', title: 'Hard disk repair', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p8', project_id: 'personal', title: 'BMI', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p9', project_id: 'personal', title: 'VC Valuation Method Excel Template', description: 'https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p10', project_id: 'personal', title: 'Propretiorship account', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p11', project_id: 'personal', title: 'ICICI card limit increase', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p12', project_id: 'personal', title: 'SEO Video Tutorial', description: 'https://www.youtube.com/watch?v=lOPIutlDFpA', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.youtube.com/watch?v=lOPIutlDFpA'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p13', project_id: 'personal', title: 'SEO Writing AI Tool', description: 'https://seowriting.ai/', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://seowriting.ai/'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT NOT IMPORTANT tasks
  { id: 'p14', project_id: 'personal', title: 'Sell laptop', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p15', project_id: 'personal', title: 'Stripe Payment', description: 'Payment checkout link', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://checkout.stripe.com/c/pay/cs_live_b15wM7oanEh0g9ELAjNVODnh3HiZcUKuuMj2qeGS437PzsxqhDEkPPK1aV'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // More not urgent/not important tasks
  { id: 'p16', project_id: 'personal', title: 'Dickie Bush Twitter thread', description: 'https://x.com/dickiebush/status/1885047573028716889', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/dickiebush/status/1885047573028716889'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p17', project_id: 'personal', title: 'SEO Twitter Thread - Natia', description: 'https://x.com/seonatia/status/1940803656762208515', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/seonatia/status/1940803656762208515'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p18', project_id: 'personal', title: 'Alex Finn Twitter Thread', description: 'https://x.com/AlexFinnX/status/1940559551138615539', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/AlexFinnX/status/1940559551138615539'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p19', project_id: 'personal', title: 'Penal charges and bounce charges CBI loan', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p20', project_id: 'personal', title: 'CBI loan analysis', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p21', project_id: 'personal', title: 'Indusind card', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p22', project_id: 'personal', title: 'Basic Prompts Twitter Thread', description: 'https://x.com/basicprompts/status/1966487017669415400', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/basicprompts/status/1966487017669415400'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p23', project_id: 'personal', title: 'Matt Gray Twitter Thread', description: 'https://x.com/matt_gray_/status/1973053054267122067', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/matt_gray_/status/1973053054267122067'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p24', project_id: 'personal', title: 'Julian Goldie SEO Thread 1', description: 'https://x.com/JulianGoldieSEO/status/1976729630666375226', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/JulianGoldieSEO/status/1976729630666375226'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p25', project_id: 'personal', title: 'Natia Kourdadze SEO Thread', description: 'https://x.com/natiakourdadze/status/1977064491528450346', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/natiakourdadze/status/1977064491528450346'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p26', project_id: 'personal', title: 'Julian Goldie SEO Thread 2', description: 'https://x.com/JulianGoldieSEO/status/1977444094298476979', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://x.com/JulianGoldieSEO/status/1977444094298476979'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// BMN tasks - Business and Marketing focused
const bmnTasks: Task[] = [
  // URGENT & IMPORTANT - Do First (Red)
  { id: 'bmn1', project_id: 'bmn', title: 'Convert export agents into affiliates', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn2', project_id: 'bmn', title: 'Convert export coaches into affiliates', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn3', project_id: 'bmn', title: 'Investment must read', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn4', project_id: 'bmn', title: 'Term sheet', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn5', project_id: 'bmn', title: 'ESOP', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // URGENT & NOT IMPORTANT - Delegate (Orange)
  { id: 'bmn6', project_id: 'bmn', title: 'Email Verifier Tool', description: 'LetsExtract Email Verifier for mailing list validation', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, links: ['https://letsextract.com/email-verifier.htm'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn7', project_id: 'bmn', title: 'For The Interested - Sponsorship Opportunities', description: 'Newsletter advertising for creative entrepreneurs', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, links: ['https://fortheinterested.com/ads/'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn8', project_id: 'bmn', title: 'Startups Seeking Investment Form', description: 'Typeform for investment applications', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, links: ['https://9cqs4pw3plw.typeform.com/to/zHNYb0Zb'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT & IMPORTANT - Schedule (Green)
  { id: 'bmn9', project_id: 'bmn', title: 'Read about guesstimation PM playbook', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn10', project_id: 'bmn', title: 'High Ticket Clients from LinkedIn Search', description: 'Google Doc guide for client acquisition', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://docs.google.com/document/d/1EAuiX-OzLhZRbUe8JDJfcySHbzMMpJ7uHEpWB6odWqE/edit?tab=t.0'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn11', project_id: 'bmn', title: 'VC Valuation Method Excel Template', description: 'Venture Capital Method for startup valuation', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.thevccorner.com/p/venture-capital-valuation-method-excel-template'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn12', project_id: 'bmn', title: 'Anshuman Sinha - Cap Table Dilution', description: 'LinkedIn post about avoiding dilution in startup cap table', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.linkedin.com/posts/anshumansinha1_startups-entrepreneurship-angelinvesting-activity-7339309661935890433-3QgA'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn13', project_id: 'bmn', title: 'Anshuman Sinha - SAFE vs Cap Table', description: 'LinkedIn post about $5M cap understanding and dilution impact', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://www.linkedin.com/posts/anshumansinha1_startups-entrepreneurship-angelinvesting-activity-7339188533867290626-TBzv'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT & NOT IMPORTANT - Eliminate (Blue)
  { id: 'bmn14', project_id: 'bmn', title: 'YouTube Video 1', description: 'Business/marketing related video', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/watch?v=qNh8WnjQbtw'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn15', project_id: 'bmn', title: 'YouTube Video 2', description: 'Business strategy content', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/watch?v=zNHKAEiyCG0&t=231s'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn16', project_id: 'bmn', title: 'YouTube Short 1', description: 'Quick business tip', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://youtube.com/shorts/gaVuF_4y-PM?si=8DmMRY8M2HPme0wj'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn17', project_id: 'bmn', title: 'YouTube Video 3', description: 'Educational content', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/watch?v=tu501rOVMGc'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn18', project_id: 'bmn', title: 'YouTube Video 4', description: 'Business insights', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/watch?v=Kr6fWPEe7wM'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bmn19', project_id: 'bmn', title: 'YouTube Short 2', description: 'Marketing tip', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/shorts/BHNPabuv3p8'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// CSuite tasks - Executive and operational focus
const csuiteTasks: Task[] = [
  // URGENT & IMPORTANT - Do First (Red)
  { id: 'cs1', project_id: 'csuite', title: 'Operations cycle for 1 client', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs2', project_id: 'csuite', title: 'Send report to Eric Waldenmaier', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs3', project_id: 'csuite', title: 'Cold email setup', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs4', project_id: 'csuite', title: 'Report link tracking for client', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs5', project_id: 'csuite', title: 'Expand team for sales', status: 'todo', priority: 'urgent_important', is_urgent: true, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // URGENT & NOT IMPORTANT - Delegate (Orange)
  { id: 'cs6', project_id: 'csuite', title: '123/1000 followers on page job', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs7', project_id: 'csuite', title: '10 LinkedIn accounts', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs8', project_id: 'csuite', title: 'Manyreach Email Automation Setup', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs9', project_id: 'csuite', title: 'Flush linkedin page of posts', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs10', project_id: 'csuite', title: 'Mahsa linkedin profile', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs11', project_id: 'csuite', title: 'Sanitize Linkedin profile', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs12', project_id: 'csuite', title: 'Review post design', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs13', project_id: 'csuite', title: '5 fake emails', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs14', project_id: 'csuite', title: '5 fake LinkedIn DM', status: 'todo', priority: 'urgent_not_important', is_urgent: true, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT & IMPORTANT - Schedule (Green)
  { id: 'cs15', project_id: 'csuite', title: 'Create Services Page for each of the Service (Website + LinkedIn)', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs16', project_id: 'csuite', title: 'FAQ for Csuite', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs17', project_id: 'csuite', title: 'Revamp case studies', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs18', project_id: 'csuite', title: 'Send form to interns for hiring', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs19', project_id: 'csuite', title: 'Improve offer based on Alex Hormozi', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs20', project_id: 'csuite', title: 'Reduce 3 months based on Chandan', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs21', project_id: 'csuite', title: 'Super.com Operating Blueprint', description: 'OKRs and methodology for scaling $0 to $200M+ revenues', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://henrythe9th.substack.com/p/supercoms-operating-blueprint'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs22', project_id: 'csuite', title: 'Linkmate.io - LinkedIn Message Tracking', description: 'Tool to track if messages are read or not', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://linkmate.io/'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs23', project_id: 'csuite', title: 'LinkedIn Tweaks by Marvin', description: 'Bootstrapped Giants LinkedIn optimization guide', status: 'todo', priority: 'not_urgent_important', is_urgent: false, is_important: true, links: ['https://grow.bootstrappedgiants.com/Loom-with-my-LinkedIn-Tweaks-1ea940d92a1f80e089e1c7fb59090a81'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // NOT URGENT & NOT IMPORTANT - Eliminate (Blue)
  { id: 'cs24', project_id: 'csuite', title: '100 million offer', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs25', project_id: 'csuite', title: '100 million lead', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs26', project_id: 'csuite', title: 'Boring Marketer Twitter Thread', description: 'Marketing insights and strategies', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/boringmarketer/status/1930327867990462495'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs27', project_id: 'csuite', title: 'YouTube Video - Educational Content', description: 'Business/marketing educational video', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://www.youtube.com/watch?v=EDJMrlk4xIw'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs28', project_id: 'csuite', title: 'Julian Goldie SEO Twitter Thread', description: 'SEO insights and tips', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/JulianGoldieSEO/status/1932180908087324844'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs29', project_id: 'csuite', title: 'Natia Kourdadze Twitter Profile', description: 'SEO expert insights and content', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://x.com/natiakourdadze'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs30', project_id: 'csuite', title: 'YouTube Tutorial Video', description: 'Business process tutorial', status: 'todo', priority: 'not_urgent_not_important', is_urgent: false, is_important: false, links: ['https://youtu.be/IhEy5s-Z_Jg?si=ejIDAGyjsCBzIOwb'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Empty tasks placeholder
const otherTasks: Task[] = [
  // Health project uses workout tracking system instead of task management
  // Journaling project has its own dedicated dashboard
];

const mockTasks: Task[] = [...personalTasks, ...bmnTasks, ...csuiteTasks, ...otherTasks];

type ViewMode = 'matrix' | 'table' | 'calendar' | 'workout';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeProject, setActiveProject] = useState<string>('personal');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const handleProjectChange = (projectId: string) => {
    setActiveProject(projectId);
    // Set appropriate view mode based on project
    if (projectId === 'health') {
      setViewMode('workout'); // Health project only shows workout tracker
    } else if (projectId === 'journaling') {
      setViewMode('matrix'); // Journaling will get its own view later
    } else {
      setViewMode('matrix'); // Regular projects use matrix/table
    }
  };

  const handleTaskMove = (taskId: string, newPriority: TaskPriority) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const { isUrgent, isImportant } = getFlagsFromPriority(newPriority);
          return {
            ...task,
            priority: newPriority,
            is_urgent: isUrgent,
            is_important: isImportant,
            updated_at: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates, updated_at: new Date().toISOString() };
          // Update priority flags if priority changed
          if (updates.priority) {
            const { isUrgent, isImportant } = getFlagsFromPriority(updates.priority);
            updatedTask.is_urgent = isUrgent;
            updatedTask.is_important = isImportant;
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Filter tasks by project and archive status
  const filteredTasks = tasks.filter(task => {
    if (task.project_id !== activeProject) return false;
    
    // If showing archived, only show done tasks
    if (showArchived) return task.status === 'done';
    
    // If not showing archived, hide done tasks
    return task.status !== 'done';
  });
  const currentProject = projects.find(p => p.id === activeProject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Task Tracker
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Organize your tasks using the Eisenhower Matrix
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hide Add Task button for Health and Journaling projects */}
              {activeProject !== 'health' && activeProject !== 'journaling' && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Add Task
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Project Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 scrollbar-hide" aria-label="Projects">
            {projects.map((project) => {
              const isActive = activeProject === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => handleProjectChange(project.id)}
                  className={`
                    whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  style={{
                    ...(isActive && { borderBottomColor: project.color }),
                    ...(isActive && { color: project.color })
                  }}
                >
                  <span className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="hidden sm:inline">{project.name}</span>
                    <span className="sm:hidden">{project.name.charAt(0)}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="p-2 sm:p-4">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: currentProject?.color }}
                  ></div>
                  <span className="hidden sm:inline">{currentProject?.name} Tasks</span>
                  <span className="sm:hidden">{currentProject?.name}</span>
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {activeProject === 'health' 
                    ? 'Your comprehensive fitness tracking system' 
                    : activeProject === 'journaling'
                    ? 'Your mental wellbeing companion'
                    : showArchived
                    ? `${filteredTasks.length} completed task${filteredTasks.length !== 1 ? 's' : ''} archived`
                    : `${filteredTasks.length} active task${filteredTasks.length !== 1 ? 's' : ''} in this project`
                  }
                </p>
              </div>
              
              {/* View Toggle and Archive Toggle - Hide for Health and Journaling projects */}
              {activeProject !== 'health' && activeProject !== 'journaling' && (
                <div className="flex items-center gap-3">
                  {/* Archive Toggle */}
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      showArchived
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {showArchived ? 'Show Active' : 'Show Archived'}
                    </span>
                    <span className="sm:hidden">
                      {showArchived ? 'Active' : 'Archive'}
                    </span>
                  </button>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('matrix')}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${
                          viewMode === 'matrix'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">Matrix</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${
                          viewMode === 'table'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <TableCellsIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${
                          viewMode === 'calendar'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Calendar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Content based on project type */}
          {activeProject === 'health' ? (
            <HealthDashboard />
          ) : activeProject === 'journaling' ? (
            <JournalDashboard />
          ) : viewMode === 'matrix' ? (
            <EisenhowerMatrix 
              tasks={filteredTasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          ) : viewMode === 'table' ? (
            <TaskTable 
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
            />
          ) : viewMode === 'calendar' ? (
            <CalendarView 
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
            />
          ) : null}
        </div>
      </main>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
      />
      
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        currentProject={activeProject}
      />
    </div>
  );
}
