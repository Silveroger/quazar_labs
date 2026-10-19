import type { Content, Track } from "./content";

const phases = [
  [
    "Foundations & tooling",
    "Make yourself at home in a developer’s workspace.",
  ],
  [
    "AI-assisted prototyping",
    "Turn a clear idea into a first version, then make it your own.",
  ],
  [
    "How applications connect",
    "Understand the connections behind every click.",
  ],
  [
    "APIs & stored information",
    "Bring real data into your project and learn how to keep it.",
  ],
  [
    "Collaboration & portfolios",
    "Build habits that help you and your teammates work together.",
  ],
  [
    "Hackathon preparation & MVPs",
    "Shape a useful idea, build the essentials, and tell its story.",
  ],
];
const junior = [
  [
    "What makes an app work?",
    "Explore the difference between the interface you see and the logic that makes it respond.",
    "Recognise interface and logic|Describe what happens when a button is clicked",
  ],
  [
    "Your first developer workspace",
    "Set up VS Code, organise project folders, and run a simple interactive web card.",
    "Create an organised workspace|Run and modify a web card",
  ],
  [
    "From an idea to a prompt",
    "Describe a small calculator or quiz to an AI coding tool using clear, plain English.",
    "Explain a project with clear constraints|Break an idea into small steps",
  ],
  [
    "Check it. Change it. Make it yours.",
    "Try the generated prototype, find errors, and improve the design while understanding each change.",
    "Test expected and unexpected inputs|Explain and modify generated code",
  ],
  [
    "The screen and the brain",
    "Discover how a client interface and server work together using everyday examples.",
    "Distinguish client and server|Sketch a simple application flow",
  ],
  [
    "Make a click do something",
    "Connect buttons to application logic and display dynamic responses on screen.",
    "Handle a user action|Update a screen with a response",
  ],
  [
    "Meet your first API",
    "Explore request and response by displaying live weather or another public data source.",
    "Explain an API in your own words|Display data from a response",
  ],
  [
    "Where does information go?",
    "Compare temporary memory with persistent storage and explore what happens after a refresh.",
    "Distinguish memory and storage|Explain why applications use databases",
  ],
  [
    "Save versions, keep your progress",
    "Learn how to track changes and organise versions without losing your work.",
    "Describe a useful change history|Organise project files for collaboration",
  ],
  [
    "Build a project portfolio",
    "Work through shared project habits and document what your project does and how to run it.",
    "Write a simple project README|Present a structured project repository",
  ],
  [
    "One problem. One useful feature.",
    "Choose a practical school or community problem and narrow the solution to a small working prototype.",
    "Write a clear problem statement|Choose one essential MVP feature",
  ],
  [
    "Explain what you built",
    "Prepare a short project deck, a simple architecture diagram, and a walkthrough of your prototype.",
    "Show how your project works|Explain your decisions in a short pitch",
  ],
];
const senior = [
  [
    "Inside a modern developer stack",
    "Explore an editor, runtime, dependencies, and the moving parts of a modular project.",
    "Identify the parts of a developer stack|Run a modular starter project",
  ],
  [
    "Terminal and project workflows",
    "Use terminal commands, organise directories, and build repeatable habits for local development.",
    "Navigate a project from the terminal|Keep project files and dependencies organised",
  ],
  [
    "Give AI useful context",
    "Frame technical prompts with context, constraints, and expected behaviour for an AI coding assistant.",
    "Write a constrained technical prompt|Evaluate generated implementation choices",
  ],
  [
    "Refactor with an AI partner",
    "Review generated code, request targeted changes, and verify the behaviour with meaningful checks.",
    "Explain code before changing it|Test a refactor against requirements",
  ],
  [
    "Design the system before the screen",
    "Map frontend, backend, and data responsibilities, including how web and mobile approaches differ.",
    "Separate system responsibilities|Draw an application architecture diagram",
  ],
  [
    "Follow a request through the app",
    "Trace an action from the user interface through request routing and back to its response.",
    "Map a request-response flow|Connect interface actions to application logic",
  ],
  [
    "REST APIs and JSON",
    "Consume a public API, parse its data, and represent loading, success, and error states.",
    "Read a JSON response|Handle API failures in the interface",
  ],
  [
    "Persist useful application state",
    "Understand database records and queries, then connect stored information to a user interface.",
    "Model simple persistent records|Explain how data is stored and retrieved",
  ],
  [
    "Git for collaborative projects",
    "Use commits, branches, and merges to coordinate changes in a team repository.",
    "Write meaningful commits|Understand a branch and merge workflow",
  ],
  [
    "A repository worth sharing",
    "Review a project’s structure, document setup, and organise evidence of what the software does.",
    "Write a useful README|Prepare a reproducible project handoff",
  ],
  [
    "Scope and assemble an MVP",
    "Translate a real problem into a focused MVP, sketch its interface, and plan its components.",
    "Prioritise essential features|Create wireframes and a system diagram",
  ],
  [
    "Deploy and tell the story",
    "Learn deployment basics, prepare a demonstration, and explain your technical decisions in a pitch.",
    "Understand a prototype deployment workflow|Present architecture and project impact",
  ],
];
function track(kind: "junior" | "senior", lessons: string[][]): Track {
  return {
    id: kind,
    slug: kind,
    title: kind === "junior" ? "Junior track" : "Senior track",
    grades: kind === "junior" ? "Grades 7–8" : "Grades 9–10",
    approach:
      kind === "junior"
        ? "Build → Understand → Modify"
        : "Design → Integrate → Deploy",
    description:
      kind === "junior"
        ? "Start with something you can see. Find out how it works. Then change it into something of your own."
        : "Think through a system, connect its moving parts, and learn to take a working prototype into the world.",
    status: "upcoming",
    modules: phases.map(([title, description], i) => ({
      id: `${kind}-module-${i + 1}`,
      title,
      description,
      status: "upcoming",
      lessons: lessons
        .slice(i * 2, i * 2 + 2)
        .map(([title, description, objectives], j) => ({
          id: `${kind}-lesson-${i * 2 + j + 1}`,
          slug: `lesson-${i * 2 + j + 1}`,
          title,
          description,
          objectives: objectives.split("|"),
          status: "upcoming",
          youtubeId: "",
          resources: [],
        })),
    })),
  };
}
export const seedContent: Content = {
  courses: [
    {
      id: "hackathon-foundations",
      slug: "hackathon-foundations",
      title: "Hackathon Foundations",
      subtitle: "Your first idea deserves a first version.",
      description:
        "Learn to turn a real problem into working software. Get comfortable with developer tools, build with AI thoughtfully, connect live data, and learn how to explain what you made.",
      prerequisites:
        "Bring a laptop or desktop, an internet connection, and a little curiosity. The Junior track starts from the basics. The Senior track goes deeper into technical workflows, with concepts introduced along the way.",
      outcomes: [
        "A clear problem statement",
        "A system architecture diagram",
        "A working software prototype",
        "A documented project repository",
        "A project pitch deck",
      ],
      status: "upcoming",
      tracks: [track("junior", junior), track("senior", senior)],
    },
  ],
  founders: [
    {
      id: "eshan",
      name: "Eshan Sharma",
      initials: "ES",
      role: "Co-founder & instructor",
      bio: "A student at Punjab Engineering College, helping younger builders get comfortable turning ideas into software.",
      photoId: "",
    },
    {
      id: "chirag",
      name: "Chirag Dhama",
      initials: "CD",
      role: "Co-founder & instructor",
      bio: "A student at Punjab Engineering College, sharing a practical approach to building, understanding, and presenting projects.",
      photoId: "",
    },
  ],
};
