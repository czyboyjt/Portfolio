
import React from 'react';
import { Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Integrate',
    category: 'Product Mgmt • Healthcare • Web App',
    description: 'Building an In-House Mental Health Platform',
    imageUrl: '/images/videos/InterVid.mp4',
    previewVideoUrl: '/images/videos/InterVid.mp4',
    overviewImageUrl: '/images/IScattered.png',
    researchImage1: [
      '/images/IPersona1.png',
      '/images/IPersona2.png'
    ],
    researchImage1Label: 'Personas',
    researchImage2: '/images/IStack.png',
    researchImage2Label: 'Ideal Stack',
    researchCarousel: [
      { url: '/images/Ibpd1.png', label: 'What is BPD' },
      { url: '/images/Ibpd2.jpg', label: 'What is BPD' }
    ],
    year: '2025',
    duration: 'Ongoing',
    role: 'Product Manager Intern',
    team: '3 PM, 4 UX Designers, 12 Engineers',
    tools: ['Figma', 'Jira', 'Notion'],
    externalUrl: 'https://example.com/integrate-live',
    challenge: 'A patchwork of third-party tools powering core functionality created a fragmented user experience and restricted the platform’s ability to scale.',
    problemStatement: 'The company was operating a rapidly scaling mental health product for individuals living with Bipolar Disorder. While effective, the product relied heavily on a patchwork of third-party tools to support core functionality. As the product grew this setup created scaling constraints due to the limited flexibility to support new features & fragmented experience across tools.',
    researchOverview: 'This project began with clear, pre-existing signals from both users and the founder, which allowed us to focus on synthesis and structure rather than exploratory research.',
    quote: 'Migrate the product to a fully in-house system',
    methods: 'User Interviews, Stakeholder Workshops, Comparative Audit, and Journey Mapping.',
    painPoints: 'Fragmented user experience across different third-party tools and a high cognitive load during sensitive onboarding.',
    researchInsights: 'Users preferred guided structure over open exploration, especially when engaging during high or low emotional states, which impacted how we decided to design the IA.',
    researchInsight2: 'Continuity mattered more than new features, The problem was not lack of content, but lack of a unified structure that made existing content easier to access and use.',
    researchInsight3: 'Third-party tools made it difficult to iterate, personalize content, or introduce adaptive experiences without workarounds, which created difficulty in scalability.',
    solution: 'We deliberately resisted feature expansion as we found it was not the main priority at the moment, instead consolidating proven workflows into a cohesive in-house system that reduced fragmentation while creating a scalable foundation for future growth.',
    features: [
      {
        title: "Unified Platform",
        description: "All existing product content and workflows consolidated into a single, cohesive platform.",
      },
      {
        title: "Updated Website",
        description: "A redesigned website aligned with the updated brand, clearly communicating the product’s value proposition and creating a more intuitive entry point for new users.",
      },
      {
        title: "Easily Adaptable Content",
        description: "A system that allows the founder and internal team to add, update, and organize content without technical expertise",
      },
      {
        title: "Scalable Foundation",
        description: "A platform architecture designed to grow with the product, without reintroduced fragmentation or user friction.",
      }
    ],
    impactMetric: '+65%',
    impactLabel: 'Completion Rate Increase',
    primaryImpactLabel: 'Primary Project Metric',
    primaryImpactDescription: 'Deliver a fully functional and unified in-house platform within 4 months.',
    impactStats: [
      { value: '1', label: 'Unified Platform', description: 'Replaced multiple third-party tools with a single scalable in-house system.' },
      { value: '20', label: 'Screens Completed', description: 'The team was able to complete, from design to execution 20 new screens' },
      { value: '-30%', label: 'Workflow Complexity', description: 'Reduced complexity of administrative work by the internal team.' },
    ],
    reflection: 'Empathy in healthcare isn’t just a buzzword; it’s a functional requirement. Designing for privacy meant rethinking standard UI components into more discreet interactions that respect a user\'s immediate environment.',
    nextSteps: 'With a scalable in-house platform now established, the next phase of the product focuses on growth and expansion. The unified system enables the company to broaden beyond Bipolar Disorder into additional personality and mental health conditions, while maintaining clarity, consistency, and trust for users. At the same time, this foundation supports ongoing investor conversations by demonstrating a product built for long-term scalability, operational efficiency, and meaningful impact.',
    processDescription: 'The execution followed an agile sprint-based methodology, emphasizing close alignment between product strategy, UX design, and engineering implementation to ensure a seamless migration.',
    processSteps: [
      {
        title: 'Roadmapping & Planning',
        subtitle: 'From structure to scale.',
        imageUrl: '/images/IRoadmap.png',
        ideationText: 'We paired Gantt-based dependency planning with Jira-driven sprint tracking. Required screens were mapped to each sprint, design roadmaps were aligned with engineering timelines, and Kanban boards provided visibility into progress,ensuring teams stayed unblocked and aligned as scope evolved.'
      },
      {
        title: 'Sprint Cycles',
        subtitle: '2 Week Sprints.',
        imageUrl: '/images/ICycle.png',
        ideationText: 'I designed and owned the design sprint framework, establishing a weekly cadence with clear deliverables, rotating team roles, and sprint-by-sprint screen allocation based on the information architecture. This structure enabled consistent progress, high-quality design critiques, and reliable handoff documentation for engineering.'

      },
      {
        title: 'Design Ops',
        subtitle: 'Supporting the systems behind design.',
        imageUrl: '/images/IDesignOp.png',
        ideationText: 'I managed the design team’s workspace by organizing files, maintaining the component library, and ensuring clear documentation. By creating a structured system for assets and facilitating regular communication between designers, I helped the team stay aligned and easily locate the resources they needed as the project evolved.'
      }
    ],
    designRational: 'The visual language was informed by the founder’s existing vision—soft, approachable, and emotionally considerate. Our role was to operationalize that aesthetic into a cohesive, accessible design system that supported clarity without compromising warmth.',
    designTypography: 'Poppins',
    designMainImage: '/images/Intover.png',
    designDetailImage1: [
      '/images/IDesign1.png',
      '/images/IDesign2.png',
      '/images/IDesign3.png',
      '/images/IDesign4.png',
    ],
    designDetailImage2: [
      '/images/IDecision1.png',
      '/images/IDecision2.png',
      '/images/IDecision3.png',
    ],
    designDetailImage3: '/images/integratelogo.jpeg',
    designSystemTitle: 'Custom Component Library',
    designSystemDescription: 'A new component library was created from scratch but was based of the Core Design System.',
    designColorPrimary: '#001C3E',
    designColorAccent: '#CFCFF3',
    designColorNeutral: '#F5F2F2',
    designOverviewSubtext: 'The goal was not just to redesign a surface-level interface, but to re-engineer the entire information architecture to serve user needs first.'
  },
  {
    id: '2',
    title: 'Talos',
    category: 'Founder • Fitness • AI-Mobile App',
    description: 'A skill-based calisthenics training app with AI coaching, XP progression, and structured skill trees.',
    imageUrl: '/images/videos/TalVid.mp4',
    overviewImageUrl: '/images/TalProblem.png',
    researchImage1: [
      '/images/TalPersona.png',
      '/images/ChatGPT Image May 16, 2026, 03_02_15 AM.png'
    ],
    researchImage1Label: 'Personas',
    researchImage2: '/images/TalComp.png',
    researchImage2Label: 'Competitive Analysis',
    researchCarousel: [
      { url: '/images/TLit.png', label: 'Literature Review' },
    ],
    year: '2026',
    duration: 'Ongoing',
    role: 'Solo Product Builder',
    team: 'Solo',
    tools: ['Claude', 'React', 'JavaScript', 'Figma', 'Supabase', 'SQL'],
    externalUrl: '',
    challenge: 'Calisthenics is one of the fastest-growing forms of fitness, yet existing apps fail to support the non-linear, skill-based nature of progression. Most platforms treat calisthenics like traditional gym training, leaving athletes without clear guidance on what to train next, how to improve technique, or how to progress toward advanced skills.',
    problemStatement: 'Existing fitness apps are built around tracking workouts, not mastering skills, leaving calisthenics athletes without personalized guidance, clear progression paths, or feedback on technique.',
    researchOverview: 'I conducted competitive analysis on existing fitness platforms, interviewed gym-goers interested in learning calisthenics to better understand their frustrations and goals, and developed user personas to identify key behavioral patterns and unmet needs.',
    quote: 'How might we create a fitness experience that helps calisthenics athletes understand what to train next, improve their technique and progress?',
    methods: 'User Interviews, Competitive Analysis, Field Studies',
    painPoints: 'Families lacked confidence in provider fit, while caregivers struggled to showcase specialized qualifications in a consistent way.',
    researchInsights: 'No clear roadmap: Beginners don’t know which exercises to do, in what order, or how to progress between skill levels.',
    researchInsight2: 'No personalised feedback: Generic YouTube videos and Reddit posts don’t account for an individual’s current strength, mobility, or training history.',
    researchInsight3: 'High dropout rates: Without a sense of progress or achievable milestones, users lose motivation and quit within weeks.',
    solution: 'Advances in conversational AI create an opportunity to build a “pocket coach” that understands where a user is in their calisthenics journey and gives them the exact next step, a personalised one that evolves every session.',
    features: [
      {
        title: "Skill Progression Trees",
        description: "The core navigation structure is built around skill trees. Each major calisthenics move has a tree of node progressions for them to follow",
      },
      {
        title: "AI Skill Coach",
        description: "The AI Skill Coach delivers personalized training guidance, adaptive progression feedback, and real-time coaching based on each user’s performance and goals.",
      },
      {
        title: "AI-Generated Workout Plans",
        description: "The AI creates and continuously adapts personalized skill-focused training plans based on each user’s goals, availability, ability level, and logged progress.",
      },
      {
        title: "Progress Tracking",
        description: "Talos tracks workouts, skill progression, performance trends, and personal bests while using AI-generated insights to visualize growth and celebrate milestones.",
      },
      {
        title: "Gamification System",
        description: "Talos uses XP, skill levels, streaks, and achievement milestones to reinforce consistent training habits and make progression through calisthenics skills feel rewarding and motivating.",
      }
    ],
  impactMetric: 'MVP',
  impactLabel: 'Delivered',
  primaryImpactLabel: 'Platform Foundation',
  primaryImpactDescription:
    'established the first functional marketplace prototype and matching logic to support special-needs caregiving at scale.',
  impactStats: [
          { value: 'Ongoing', label: 'Project', description: 'Project is still ongoing and being built so no metrics have been met yet' },

  ],
    reflection: 'Building Talos taught me that AI is most powerful when paired with clear vision and direction, helping accelerate both product ideation and development. The process made me more confident as a product builder by strengthening how I think about systems, planning, and AI-assisted creation rather than just writing code manually.',
    nextSteps: 'The next phase of Talos focuses on continued user testing, expanding the exercise and skill library, enhancing the AI coaching system, and introducing deeper personalization to better adapt training to each individual athlete.',
    processDescription: 'The engineering process leveraged a modern tech stack including Typescript, AI-integrated APIs, Supabase, SQL, and native mobile tools like Capacitor to create a responsive, personalized training experience while balancing UX quality with technical feasibility.',
    processSteps: [
    {
      title: 'Product Planning & Feature Prioritization',
      subtitle: 'Defining the MVP experience and roadmap.',
      imageUrl: '/images/TalPlan.png',
      ideationText: 'I created product requirement documents (PRDs), used Kano analysis to prioritize features based on user value and complexity, and established the scope for the first version of the app to ensure development stayed focused on the core experience.'
    },
    {
      title: 'Skill Tree & Progression System',
      subtitle: 'Designing the learning framework.',
      imageUrl: '/images/TalSkill.png',
      ideationText: 'I researched how calisthenics athletes learn and progress through skills, then translated those insights into a structured skill tree, leveling system, and progression framework that guides users through movements with clear advancement paths and supporting exercises (Picture is not mine but used as a reference).'
    },
    {
      title: 'Backend Architecture & API Integration',
      subtitle: 'Building the technical foundation.',
      imageUrl: '/images/TalBack.png',
      ideationText: 'I structured the backend architecture using Supabase & SQL to manage user, workout, and progression data while integrating external APIs to power AI coaching, personalized recommendations, and dynamic training experiences.'
    },
    {
      title: 'Design + Development Execution',
      subtitle: 'From Figma to functional MVP.',
      imageUrl: '/images/TalDD.png',
      ideationText: 'I designed the interface in Figma before developing the application using Claude Code, iterating rapidly through AI-assisted development while testing and refining the experience directly in Xcode to deliver a functional mobile MVP.'
    }
    ],
    designRational: 'The visual direction centered on creating a premium, cinematic experience inspired by themes of evolution, mastery, and personal growth. Classical statue imagery was used to abstract the athlete experience away from specific individuals, making progression feel more timeless, aspirational, and personally adaptable to each user.',
    designTypography: 'Outfit',
    designMainImage: '/images/TalOver.png',
    designDetailImage1: [
      '/images/TalD1.png',
      '/images/TalD2.png',
      '/images/TalD3.png',
      '/images/TalD4.png'
    ],
    designDetailImage2: [
      '/images/TalosDesign2.png'
    ],
    designDetailImage3: '/images/TalosIcon.png',
    designSystemTitle: 'Custom UI Component',
    designSystemDescription: 'I built a custom design system for Talos.',
    designColorPrimary: '#3B3B37',
    designColorAccent: '#05DF72',
    designColorNeutral: '#E0E0E0',
    designOverviewSubtext: 'Talos was built to simplify the complex journey of learning calisthenics by combining structured skill progression, personalized AI coaching, and motivating progression systems into one adaptive training experience.'
  },
  {
    id: '3',
    title: 'Marketeq Digital',
    category: 'Product • B2B SaaS • Dashboard',
    description: 'Transforming navigation with structured tagging.',
    imageUrl: '/images/videos/Markvid.mp4',
    previewVideoUrl: '/images/videos/Markvid.mp4',
    overviewImageUrl: '/images/Msort.jpg',
    researchImage1: [
      '/images/MPersona 1.png',
      '/images/MPersona 2.png',
      '/images/MPersona 3.png',
      
    ],
    researchImage1Label: 'Personas',
    researchImage2: '/images/MTesting.png',
    researchImage2Label: 'Usability Testing',
    researchCarousel: [
      { url: '/images/MComp1.png', label: 'Competitive Audit: MailChimp' },
      { url: '/images/MComp2.png', label: 'Competitive Audit: Omnisend' },
      { url: '/images/MComp3.png', label: 'Competitive Audit: ClickUp' }
    ],
    year: '2023',
    duration: '8 Months',
    role: 'Product Design & Strategy',
    team: '1 PM, 12 Junior Designers, 4 Engineers',
    tools: ['Figma', 'Miro', 'UserTesting' ],
    externalUrl: 'https://example.com/marketeq-proto',
    challenge: 'Marketeq Digital is a SaaS company that offers consulting services dedicated to optimizing business decisions for technology companies. My responsibility was to redesign the navigation of the software by implementing a tag system which allowed users to easily group and find their content efficiently.',
    problemStatement: 'Currently, users are able to create an infinite amount of files and content when managing their content. The application has no way for users to methodically group, organize and later find their information. We were tasked with finding a way to allow users to group their information.',
    researchOverview: 'We audited all of our competitors navigation and organization systems to scout how the best in class companies were handling a similar problem.',
    quote: 'How might we design a system that helps users group and find content effortlessly?',
    methods: 'Competitive Analyses, Usability testing',
    painPoints: 'As content scales, the platform becomes harder to navigate, creating friction for users trying to find and organize their work efficiently.',
    researchInsights: 'Leading SaaS platforms use tags to let content live in multiple contexts at once, giving users freedom to organize by client, campaign, or purpose.',
    researchInsight2: 'Successful products treat tags as navigation tools, allowing users to quickly filter, combine, and surface relevant content rather than relying on manual browsing.',
    researchInsight3: 'The most usable tagging systems avoid infinite tag sprawl by guiding users toward consistent, recognizable labels, preserving usability as the platform scales.',
    solution: 'Enhance the navigation experience for users, so they can easily find and orgainze their content.',
    features: [
      {
        title: "Dedicated Tag System",
        description: "Custom tags to help users group and organize content beyond folders.",
      },
      {
        title: "Smart Filtering & Search",
        description: "Tags were fully integrated into search and filters, enabling users to instantly surface relevant content.",
      },
      {
      title: "Multi-Tag Organization",
      description: "Users could apply multiple tags to a single asset.",
      },
      {
        title: "Additional Tag Features",
        description: "With added tag features such as tag permissions, history, suggestions and categories.",
      }
    ],
    primaryImpactLabel: 'Primary Project Metric',
    primaryImpactDescription: 'Significantly (by over 30%) increase the user navigation & content discovery experience for users.',
    impactStats: [
      { value: '1', label: 'Tag System', description: 'Delivered a fully functional tag system to the application' },
      { value: '+10', label: 'New Features', description: 'The new tag system gave users over +10 new ways to sort, filter, find and navigate to their content.' },
      { value: '+73%', label: 'Content Discovery Speed', description: 'With Tags users were able to find their content at almost 2x the speed' },
    ],
    reflection: 'This internship accelerated my growth as both a designer and product thinker. Through stakeholder communication, sprint ownership, and close collaboration with engineers and senior designers, I gained confidence in making and defending design decisions. As I took on more end-to-end responsibility, I realized how much I enjoy the product management side—aligning teams, shaping direction, and connecting user needs to scalable execution.',
    nextSteps: 'Following the initial tagging system redesign, we began extending tags into additional workflows, including early designs for integrating tagging into automated campaign processes. The next phase is to broaden testing beyond the beta user group to validate usability at scale.',
    processDescription: 'The project utilized a modular design framework, allowing for rapid iteration and validation of the tagging system within existing user workflows without disrupting core operations.',
    processSteps: [
      {
        title: 'Feature Prioritization',
        subtitle: 'Maximizing impact',
        imageUrl: '/images/MCow.png',
        ideationText: 'We applied the Kano Method to prioritize the tag features that would drive the most user value.'
      },
      {
        title: 'User Flow',
        subtitle: 'Streamlining content discovery',
        imageUrl: '/images/MFlow.png',
        ideationText: 'We designed user flows that streamlined how clients tagged, grouped, and searched for content—making navigation faster, clearer, and more consistent.'
      },
      {
        title: 'Wireframing & Prototyping',
        subtitle: 'Getting it to the users',
        imageUrl: '/images/Mwire.png',
        ideationText: 'Because we leveraged an existing component library, we were able to rapidly translate workflows into low-fidelity wireframes and interactive prototypes. This speed allowed us to quickly validate the tagging experience with users and iterate early before moving into full implementation.'
      },
    ],
    designRational: 'The founder had a clear visual direction centered on a clean, polished SaaS aesthetic. We built within an existing design system to maintain consistency and usability as the platform evolved.',
    designTypography: 'Inter',
    designMainImage: '/images/MD1.png',
    designDetailImage1: [
      '/images/MD1.png'
    ],
    designDetailImage2: [
      '/images/Mdesign.png',
      '/images/Mdesign2.png',
      '/images/Mdesign3.png',
    ],
        designDetailImage3: '/images/Micon.png',
    designSystemTitle: 'Untitled UI Library',
    designSystemDescription: 'We leveraged the Untitled UI design system to maintain a clean, modern, and highly polished interface.',
    designColorPrimary: '#306CFE',
    designColorAccent: '#778091',
    designColorNeutral: '#ffffff',
    designOverviewSubtext: 'The goal was to transform complex content hierarchies into a modular, tag-based navigation system that scales with the user\'s needs.'
  },
 {
    id: '4',
    title: 'Seerlight',
    category: 'Design & Research • Education • Web App',
    description: 'Reimagining the college admissions system through gamification & personalization',
    imageUrl: '/images/videos/SeeVid.mp4',
    previewVideoUrl:'/images/videos/SeeVid.mp4',
    overviewImageUrl: '/images/Supplement.png',
    researchImage1: [
      '/images/SPersona 1.png',
      '/images/SPersona 2.png',
    ],
    researchImage1Label: 'Personas',
    researchImage2: '/images/Graph 2026-03-06 at 3.25.21 AM.png',
    researchImage2Label: 'Secondary Research',
    researchCarousel: [
      { url: '/images/SComp1.png', label: 'Competitive Audit: Naviance' },
      { url: '/images/SComp2.png', label: 'Competitive Audit: CollegeLeaps' },
      { url: '/images/SComp3.png', label: 'Competitive Audit: RaiseMe' }
    ],
    year: '2023',
    duration: '6 Months',
    role: 'UX Architect',
    team: '1 UX/UI Architect, 1 Product Manager, 2 Engineers',
    tools: ['Figma', ],
    externalUrl: 'https://example.com/seerlight-archive',
    challenge: 'SeerLight is an e-learning company whose mission it is to educate students about the college admissions system.SeerLight seeks to revolutionize the process by adding gamification and personalized guides with the aim of easing the college admissions process.',
    problemStatement: 'The college admissions process is challenging for many students due to unclear guidance, varying application requirements across schools, and limited access to experienced feedback. Without a clear starting point or consistent support, students often struggle to manage deadlines, interpret expectations, and evaluate the strength of their applications, leading to unnecessary stress and inequity.',
    researchOverview: 'We tested the experience with 20 students from both high school and undergraduate backgrounds to uncover where the admissions process felt most confusing or overwhelming.',
    quote: 'How might we make the college admissions process easier for students to understand, manage, and succeed in?',
    methods: '15 User Interviews, Remote Usability Testing, Card Sorting.',
    painPoints: 'The college admissions process feels stressful and hard to navigate creating an additional barrier for prospective students.',
    researchInsights: 'A sample study found that 25% of students left their applications uncompleted and abandoned the whole process, even though they were equally as qualified',
    researchInsight2: 'Students reported feeling overwhelmed by the length & complexity of the admissions process and struggled to stay engaged.',
    researchInsight3: 'Younger users, specifically those in highschool that were prospective applicants, respond better to guided, playful structure.',
    solution: 'Create an product that simplifies the college admissions process and keeps users engaged',
    features: [
      {
        title: "Guided Assistance",
        description: "Receive personalized insights on college material, like entrance essays and other supplemental material",
      },
      {
        title: "Personalized Planner",
        description: "Let the app organize your deadlines and submission dates, so that you never forget one.",
      },
      {
        title: "Peer Guidance",
        description: "Connect with college students and fellow highschoolers, to build a community.",
      },
      {
        title: "Educational Courses",
        description: "Learn from free courses that peers and mentors upload, to be educated on the college application process.",
      }
    ],
    primaryImpactLabel: 'Primary Project Metric',
    primaryImpactDescription: 'Deliver a fully functional web application that is ready to be deployed and tested in schools.',
    impactStats: [
      { value: 'Pre-seed', label: 'Funding Raised', description: 'The project successfully secured pre-seed funding based on the initial MVP and research.' },
      { value: 'Acquired', label: 'Non-Profit Acquisition', description: 'Acquired by a non-profit to serve low-income students across the region.' },
      { value: '20+', label: 'User Interviews', description: 'Validated the gamified approach with students from diverse backgrounds.' },
    ],
    reflection: 'In this sprint I was able to work throughout with an engineer and work on my stakeholder management. Converting stakeholder ideas into real design solutions was also a learning experience for me. Figuring out how to make the stakeholders happy whilst keeping the experience optimal which did not always go together. I had to learn when to be more adamant when explaining some design decisions which allowed me to work on my communication and made me a better designer.',
    nextSteps: 'Seerlight was raised into a pre-seed and then acquired by a non-profit company that is currently using the curriculum to work with low income students! However, moving forward I would have loved to create a mobile version of the application because I believe that would translate well to the primary user base',
    processDescription: 'The design journey prioritized empathetic engagement, utilizing user research to break down systemic educational barriers into intuitive, gamified milestones.',
    processSteps: [
      {
        title: 'Information Architecture',
        subtitle: 'Organizing the information',
        imageUrl: '/images/infoarchSeer.png',
        ideationText: 'Our goal was simplicity and ease of use so we aimed to we design an information hierarchy that transformed a complex process into clear, step-by-step pathways.'
      },
      {
        title: 'Wireframing',
        subtitle: 'Focusing on function',
        imageUrl: '/images/WireframSeer.png',
        ideationText: 'Low-fidelity wireframes helped us validate structure and flow, ensuring students always had a clear next step.'
      },
      {
        title: 'Revisions',
        subtitle: 'Iterating on the initial concept',
        imageUrl: '/images/SRevision.png',
        ideationText: 'The original product owner had early design concepts in place. After usability testing and rescoping discussions, I revised the designs to improve clarity, usability, and overall flow for students navigating the platform.'
      },
    ],
    designRational: 'The founder wanted this aimed at a younger audience, he said he was aiming for a Whimsical and Magical. He gave Duolingo as an application to based the designs on. Thus I went with a very stylized art style, with “The Magician” as our version of Duo.',
    designTypography: 'Jost',
    designMainImage: '/images/see1.png',
    designDetailImage1: [
      '/images/Sdesign1.png',
      '/images/Sdesign2.png',
      '/images/Sdesign3.png',
      '/images/Sdesign4.png'
    ],
    designDetailImage2: [
      '/images/SDecision1.png',
      '/images/SDecision2.png',
      '/images/SDecision3.png'
    ],
    designDetailImage3: '/images/SBanner.png',
    designSystemTitle: 'Custom Component Library',
    designSystemDescription: 'A new component library was created from scratch but was based of the Material UI System.',
    designColorPrimary: '#5e90fb',
    designColorAccent: '#8dbbfc',
    designColorNeutral: '#ffffff',
    designOverviewSubtext: 'The goal was to reimagine the stressful college admissions process as a guided, engaging, and equitable journey for every student.'
  }
  
];

export const SIDE_PROJECTS: Project[] = [
  {
    id: 's1',
    title: 'MyTaste',
    category: 'Personal • Mobile • App Design',
    description: 'A concept app designed with the purpose of assisting users when ordering food.',
    imageUrl: 'https://images.unsplash.com/photo-1485842299126-7bc5ad7a57ef?auto=format&fit=crop&q=80&w=1000',
    previewVideoUrl: '/images/videos/MTVid.mp4',
    duration: 'Jun - Sept 2024',
    role: 'Product Design',
    org: 'Personal',
    collaborators: [],
    tools: ['Figma', 'SPSS'],
    problemStatement: 'People struggle to confidently try new restaurants because unfamiliar menus, unclear food expectations, and scattered review processes make decision-making overwhelming and risky.',
    researchOverview: 'Research showed that people struggle to confidently try new restaurants due to unfamiliar menus, unclear expectations around food quality and taste, and the effort required to sift through reviews and photos. Existing recommendation platforms failed to meaningfully solve this problem within the restaurant experience itself, revealing a gap in the market for a personalized assistant that tailors food recommendations to individual user preferences in real time.',
    solution: 'To simplify restaurant decision-making, I designed an app focused on two core features: personalized food recommendations based on each user’s ingredient and taste preferences, and a community review system that surfaces opinions from users with similar tastes.',
    reflection: 'This project strengthened my ability to translate research into product decisions by using methods like user interviews, A/B testing, and SPSS analysis to better understand user behavior and validate design choices.',
    conclusion: 'By combining personalized recommendations with socially relevant reviews, the app helps users feel more informed and confident when exploring new restaurants.',
    overviewImageUrl: '/images/MTbanner.png',
    externalUrl: 'https://example.com/mytaste-casestudy',
    researchImage1: '/images/Story.png',
    researchImage2: '/images/CompA.png',
    researchImage3: '/images/Journey.png',
    solutionImage: '/images/Branding.png',
    designMainImage: '/images/videos/MTVid2.mp4',
    designDetailImage1: [
      '/images/Moc2.png',
      '/images/MU1.png'
    ]
  },
    {
    id: 's2',
    title: 'GMC Interface',
    category: 'School Project • Automotive • UI/UX',
    description: 'Redesigning the GMC Sierra AT4.',
    imageUrl: '/images/GMDesign3.png',
    previewVideoUrl:'/images/videos/GMC2.mp4',
    duration: 'Jan - May 2026',
    role: 'UX/UI Designer ',
    org: 'University of Michigan & GMC',
    collaborators: ['Jonte Taffe', 'Rayoun Choi', 'Marie Nurdaulet'],
    tools: ['Miro', 'Figma', 'Gemini'],
    problemStatement: 'When using EV trucks beyond driving, users lack clear understanding and control of their energy usage, making it difficult to balance experience with range.',
    researchOverview: 'Research revealed four major gaps in the EV experience: users felt overwhelmed by energy management, uncertain about vehicle reliability, lacked confidence using EVs in outdoor scenarios, and were often unaware of the full capabilities their vehicles could offer.',
    solution: 'We designed an intelligent, activity-aware system that adapts power usage, physical truck features, and the interface adjusts based on the context.',
    reflection: 'Designing for GM’s EV truck experience taught me how to balance innovation with real-world constraints, a mindset that continues to shape how I approach product building across different domains.',
    conclusion: 'By introducing adaptive, context-aware modes like Outdoor Mode, the truck evolves into an intelligent platform that responds to user needs in any environment.',
    overviewImageUrl: '/images/GMover.jpeg',
    researchImage1: '/images/GMR1.png',
    researchImage2: '/images/GMR3.png',
    researchImage3: '/images/Gscenario.png',
    solutionImage: '/images/GMSolution.png',
    designMainImage: '/images/videos/GMC3.mp4',
    designDetailImage1: [
      '/images/GMDesign1.png',
      '/images/GMDesign3.png'
    ]
  },
    {
    id: 's3',
    title: 'Muskegon Polish Festival',
    category: 'Client Project • Tourism • Developer',
    description: 'Developing interactive mobile experiences for the Muskegon Polish Festival.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
    previewVideoUrl:'/images/videos/MuskegonFilm.mp4',
    duration: 'Jan - May 2026',
    role: 'Developer • Product Owner', 
    org: 'Muskegon Polish Festival',
    collaborators: ['Jonte Taffe', 'Boran Yang','Sami Pratt', 'Siraaj Kudtarkar', 'Xiwen Cao' ],
    tools: ['Jira', 'Confluence', 'Figma', 'React Native', 'Typescript'],
    problemStatement: 'The Muskegon Polish Festival found that presenting cultural history through static posters made information difficult to access and engage with, especially for younger visitors, causing meaningful heritage and stories to be lost within the larger festival experience.',
    researchOverview: 'We followed a collaborative Agile process with rotating leadership, democratic task management, and continuous team communication. Regular syncs, asynchronous updates, and sprint retrospectives helped us refine our workflow and maintain steady progress.',
    solution: 'We designed a connected mobile and tablet experience that transforms static festival history into an interactive journey through personality-based quizzes, maps, and layered cultural content. By combining playful interaction with deeper exploration, the experience helps younger audiences engage with and connect to Polish heritage in a more meaningful way.',
    reflection: 'This project strengthened my ability to collaborate with stakeholders by learning how to communicate technical ideas in a clear, accessible way while balancing project goals with realistic scope and development constraints.',
    conclusion: 'The final experience created a more engaging and accessible way for festival visitors to explore Polish heritage, ultimately earning first place recognition and an award for its impact, innovation, and cultural storytelling.',
    overviewImageUrl: '/images/MuskOver.webp',
    researchImage1: '/images/MuskR3.png',
    researchImage2: '/images/MuskR1.png',
    researchImage3: '/images/MuskR2.png',
    solutionImage: '/images/Musksol.png',
    designMainImage: '/images/videos/MuskegonFilm.mp4',
    designDetailImage1: [
      '/images/MuskD1.png',
      '/images/MuskD2.png'
    ]
  },
  {
    id: 's4',
    title: 'Twyne',
    category: 'School Project • UI/UX',
    description: 'Twyne is an AI-powered app that helps users network with confidence.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
    previewVideoUrl:'/images/videos/TwyneDemo.mp4',
    duration: 'Sept - Dec 2024',
    role: 'UX/UI Designer',
    org: 'University of Michigan',
    collaborators: ['Jonte Taffe', 'Tiffany Jo', 'Carol Zhu', 'Vaishnavi V'],
    tools: ['Figma'],
    problemStatement: 'Networking is widely encouraged, but it often feels overwhelming, intimidating, and complex, especially for those starting a new career. Our goal is to create a solution that makes networking a simple, enjoyable, and accessible process.',
    researchOverview: 'Research showed that users viewed networking as one of the most effective ways to find career opportunities, but many struggled with the stress, uncertainty, and social pressure involved in starting and maintaining professional connections.',
    solution: 'Twyne simplifies networking through features like AI-powered insights dashboards, coffee chat booking, integrated messaging and video calls, and real-time AI conversation support that suggests discussion topics to help users network with more confidence and ease.',
    reflection: 'This project taught me the importance of clearly defining a focused problem space, as narrowing our scope allowed us to create more intentional features, validate meaningful solutions, and better address real user pain points.',
    conclusion: 'Twyne demonstrates how AI-driven support and streamlined networking tools can make professional connections feel more accessible, structured, and less intimidating for users.',
    overviewImageUrl: '/images/Project-Slide.png',
    researchImage1: '/images/Tresearch.png',
    researchImage2: '/images/TComp.png',
    researchImage3: '/images/TINfo.png',
    solutionImage: '/images/Tsolution.png',
    designMainImage: '/images/videos/Twynev2.mp4',
    designDetailImage1: [
      '/images/HIFI 1.png',
      '/images/THifi2-1.png'
    ]
  },
];
