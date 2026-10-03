import { notFound } from "next/navigation";
import { CampusModule } from "@/components/campus-module";

const modules = {
  community: {
    eyebrow: "Make something happen together", title: "Community Connect", intro: "A place for the questions, skills, and ideas that are better shared.", action: "Start a conversation", search: "Search requests, skills, or ideas", signedInRequired: true,
    records: [
      { title: "Looking for a partner for the campus sustainability challenge", description: "I’m prototyping a low-cost system to track waste segregation around hostels. Looking for someone into product design or IoT to brainstorm with.", category: "Collaboration", meta: "Today · 10:24 AM", tag: "TEAM OF 2" },
      { title: "Anyone have the Data Structures lab notes from last week?", description: "Missed the Thursday lab due to a fever. Happy to share my DBMS notes in return.", category: "Study help", meta: "Today · 9:08 AM", tag: "STUDY HELP" },
      { title: "Weekend photography walk: join us around Roorkee", description: "Beginner-friendly, phone cameras welcome. We’ll meet near the main gate and walk by the canal.", category: "Community", meta: "Yesterday · 6:40 PM", tag: "OPEN INVITE" },
    ],
  },
  safety: {
    eyebrow: "A safer campus, together", title: "Safety & care", intro: "Share a concern privately. Your safety matters, and asking for help is always okay.", action: "Submit a concern", search: "Search support resources", signedInRequired: true,
    actionHref: "/safety/new",
    records: [
      { title: "Submit an anonymous campus concern", description: "Your identity is protected from public view. A trusted campus administrator can follow up while you track progress with a private reference code.", category: "Report", meta: "Private · Secure submission", tag: "CONFIDENTIAL" },
      { title: "Need urgent help right now?", description: "For an immediate emergency, contact local emergency services or campus security directly. The platform is not an emergency-response service.", category: "Urgent support", meta: "Available any time", tag: "URGENT" },
      { title: "How complaint tracking works", description: "After signing in, submit a report and save its reference code. Use the code to see status updates without exposing your report publicly.", category: "Guidance", meta: "2 min read", tag: "YOUR PRIVACY" },
    ],
  },
  "lost-found": {
    eyebrow: "Little things find their way", title: "Lost & found", intro: "Lost something on campus or found an item that needs its person? Let’s reconnect it.", action: "Post an item", search: "Search items or campus locations", signedInRequired: true,
    actionHref: "/lost-found/new",
    records: [
      { title: "Found: blue water bottle near the library steps", description: "Matte blue bottle with a small mountain sticker. Handed in at the library desk.", category: "Found", meta: "Today · 11:10 AM", tag: "FOUND" },
      { title: "Lost: black spectacles case", description: "Possibly left in Block B seminar room after the 2 PM lecture. Name initials inside: R.K.", category: "Lost", meta: "Today · 9:32 AM", tag: "LOST" },
      { title: "Found: student ID card outside the canteen", description: "Card is safe with the student help desk. Owner can describe the lanyard to claim it.", category: "Found", meta: "Yesterday · 3:45 PM", tag: "FOUND" },
    ],
  },
  notices: {
    eyebrow: "One place for campus updates", title: "Notice board", intro: "The important dates, opportunities, and little campus moments worth knowing.", action: "Publish a notice", search: "Search notices or departments",
    records: [
      { title: "Mid-semester examination schedule", description: "The provisional schedule is now available. Please review your department timetable and report clashes to the Examination Cell by Wednesday.", category: "Academic", meta: "06 Oct · Examination Cell", tag: "IMPORTANT" },
      { title: "Design thinking lab: open registrations", description: "A hands-on session to turn early ideas into testable prototypes. Open to all year groups; seats are limited.", category: "Academic", meta: "08 Oct · Innovation Cell", tag: "REGISTRATION OPEN" },
      { title: "Campus clean-up & chai morning", description: "Bring a friend, comfortable shoes, and a reusable cup. Meet outside the student activity centre.", category: "Events", meta: "11 Oct · Student Council", tag: "CAMPUS LIFE" },
      { title: "Scholarship document verification window", description: "Students who applied for the state scholarship can visit the accounts office with original documents.", category: "Deadlines", meta: "14 Oct · Student Welfare", tag: "DEADLINE" },
    ],
  },
  support: {
    eyebrow: "You don't have to figure it all out alone", title: "Student support", intro: "A thoughtful starting point for wellbeing, academic guidance, and the next chapter.", action: "Request support", search: "Search support topics", signedInRequired: true,
    records: [
      { title: "Counselling & wellbeing", description: "Request a confidential conversation with a campus counsellor. Your message is visible only to authorized support staff.", category: "Wellbeing", meta: "Confidential · By appointment", tag: "PRIVATE" },
      { title: "Career & mentoring", description: "Talk through internships, portfolios, interviews, or what you might want to explore next.", category: "Career", meta: "Student guidance · Request a session", tag: "CAREER" },
      { title: "Academic support", description: "Find study groups, peer explanations, and helpful campus resources for your courses.", category: "Academic", meta: "Peer community · Open access", tag: "PEER SUPPORT" },
    ],
  },
  accommodation: {
    eyebrow: "A place to feel at home", title: "Stay & share", intro: "Explore student accommodation options and share trusted local recommendations.", action: "Add a listing", search: "Search areas or accommodation", signedInRequired: true,
    records: [
      { title: "Accommodation listings are coming soon", description: "We’re preparing verified local listings and safety checks before opening this service. For now, ask the student support desk for current guidance.", category: "Updates", meta: "Phase 2 preview", tag: "COMING SOON" },
    ],
  },
  market: {
    eyebrow: "Good things deserve a second life", title: "UniMarket", intro: "A student-to-student place for books, supplies, and useful finds.", action: "List an item", search: "Search books, supplies, or items", signedInRequired: true,
    records: [
      { title: "UniMarket is getting ready", description: "We’re building a safer campus marketplace with verified student accounts and clear reporting. Listings will open after those protections are in place.", category: "Updates", meta: "Phase 2 preview", tag: "COMING SOON" },
    ],
  },
  profile: {
    eyebrow: "Your campus identity", title: "My profile", intro: "Your UniConnect profile will hold your campus details and activity preferences.", action: "Sign in to continue", search: "Profile settings",
    records: [
      { title: "Preview profile", description: "Sign in with your COER student email to manage your profile. Your personal details are never shown on anonymous community posts.", category: "Account", meta: "Account required", tag: "GUEST VIEW" },
    ],
  },
} as const;

export default async function SectionPage({ params }: { params: { section: string } }) {
  const config = modules[params.section as keyof typeof modules];
  if (!config) notFound();
  return <CampusModule config={config} />;
}
