export interface GuideLesson {
  id: string;
  title: string;
  group: string;
  introduction: string;
  sections: [string, string][];
  code?: string;
  question: string;
  answer: string;
  resources: string[];
}

export const GUIDE_LESSONS: GuideLesson[] = [
  {
    id: 'python', title: 'WTF is Python?', group: 'Getting started',
    introduction: 'Python is a language for writing instructions a computer can repeat. Suppose you want the average of three deliveries. You can work it out once on paper. A small Python program can do the same job tomorrow when the numbers change.',
    sections: [
      ['Read your first program', 'The first line below names a list of delivery times. sum adds them together. len counts how many there are. print displays the result. Read it once and predict the number you will see.'],
      ['How this becomes useful in AI', 'A model might predict a delivery time. Python can read past deliveries, give the examples to a training library, then compare the predictions with the actual times. You can learn that last step with a handful of numbers before training anything.'],
      ['What is a module?', 'A module groups reusable Python code under a name. For example, Python includes a statistics module. After writing “from statistics import mean”, you can use mean(minutes) to do the calculation below. Other libraries, such as pandas for tables, are installed separately.'],
      ['A first course path', 'Start with variables and functions, then loops for repeating work, libraries for importing tools, and files for reading your own data. Harvard’s CS50P teaches these with exercises. For a first visual explanation of machine learning, follow the handwritten-digit lesson below.'],
    ],
    code: 'minutes = [10, 20, 30]\nprint(sum(minutes) / len(minutes))',
    question: 'If the last delivery takes 60 minutes instead of 30, what will Python display?',
    answer: '30.0. The total is now 90 and there are still three deliveries. Changing one input changes the result without rewriting the calculation.',
    resources: ['res-cs50p', 'res-python-video', 'res-neural-intro'],
  },
  {
    id: 'harness', title: 'WTF is an agent harness?', group: 'Getting started',
    introduction: 'Ask an assistant, “When is the design review?” A language model can suggest looking in your notes. The harness is the software around the model that decides which notes it may read, carries out the lookup, and gives the result back.',
    sections: [
      ['Follow one request', 'You select the project notebook. The model requests a search for “design review”. The harness checks your access, calls the search tool, and returns the matching line. The assistant can now answer “Thursday at 10”, with a link to check.'],
      ['Where responsibility lives', 'The model proposes the lookup. The tool searches. The harness tracks the conversation, enforces permissions, and stops after an answer, a failure, or a limit on steps. If a note asks to forward the notebook, that text grants no permission to send it.'],
      ['Two meanings of harness', 'An agent harness runs a task. An evaluation harness measures performance by running known cases and comparing outcomes with expectations. For this assistant, a useful evaluation checks the date, the source, and whether private notebooks stayed private.'],
    ],
    question: 'The notebook is unavailable. What should the assistant report?',
    answer: 'It should say the lookup failed and ask for an accessible note. A plausible date is still a guess.',
    resources: ['res-anthropic-effective-agents'],
  },
  {
    id: 'openclaw', title: 'WTF is OpenClaw?', group: 'Assistants and frameworks',
    introduction: 'OpenClaw connects a chat channel to an AI assistant you run on your infrastructure. Its gateway receives a message, routes it to an agent, and sends the result back to the conversation.',
    sections: [
      ['Where it fits', 'Imagine asking in chat for a morning briefing. A connected calendar supplies today’s events, the configured model drafts the summary, and the gateway delivers it. You choose which accounts and tools that assistant can reach.'],
      ['What to check before connecting an account', 'Decide who can message the assistant, which calendar it may read, and where replies may appear. Running the gateway yourself still leaves a separate decision about the model provider that receives the text. A shared chat needs its own access rules.'],
    ],
    question: 'Which permission does a calendar briefing need?',
    answer: 'Reading the relevant calendar is enough. Creating events or sending invitations would require a separate reason.',
    resources: ['res-openclaw'],
  },
  {
    id: 'hermes', title: 'WTF is Hermes Agent?', group: 'Assistants and frameworks',
    introduction: 'Hermes Agent is an assistant from Nous Research that can use tools and keep reusable instructions called skills. Here “Hermes” means the agent software. Nous also uses the name for a family of language models.',
    sections: [
      ['Where it fits', 'Suppose you prepare the same weekly inventory report. A skill can record the steps for reading a table and formatting a summary. Another session can reuse that procedure with this week’s figures.'],
      ['What persists', 'A saved skill records a procedure. Memory can hold details across sessions. Both need review when a process changes. Keep customer records out of reusable instructions and review a skill before allowing it to act on important files. Saving a skill does not retrain the model.'],
    ],
    question: 'The report layout changes next week. What should you update?',
    answer: 'Review the saved reporting skill and try the revised procedure on a sample table.',
    resources: ['res-hermes'],
  },
  {
    id: 'langchain', title: 'WTF is LangChain?', group: 'Assistants and frameworks',
    introduction: 'LangChain is a library developers use to build their own AI applications. It gives an application a common way to call models and offer tools. The developer supplies the interface, data access rules and user experience.',
    sections: [
      ['Where it fits', 'A shop wants a support assistant inside its order page. Its developer can give the model a tool for checking delivery status. The application looks up the signed-in customer and only returns orders that customer may see.'],
      ['Choosing between the tools', 'For an assistant reached through an existing chat channel, explore OpenClaw. For repeated personal tasks that can become saved skills, explore Hermes Agent. For a feature inside a product you build, LangChain supplies building blocks. The use cases overlap. A fixed order-status button can simply call the order service directly.'],
    ],
    question: 'Who checks that a customer owns the order?',
    answer: 'The application or order service must check the signed-in identity for every lookup. A model-generated order number cannot establish ownership.',
    resources: ['res-langchain', 'res-anthropic-effective-agents'],
  },
  {
    id: 'langgraph', title: 'WTF is LangGraph?', group: 'Assistants and frameworks',
    introduction: 'LangGraph is a runtime for arranging work into steps with shared state. In a workflow graph, each point represents a step and each arrow indicates where execution can go next.',
    sections: [
      ['Where it fits', 'For a refund request, look up the order, calculate the amount, then wait for approval. A checkpoint saves the current state so the workflow can continue when the reviewer returns.'],
      ['Designing for retries', 'A workflow can resume after a failure. Give the refund request a stable identifier and have the payment service recognize retries, so resuming the workflow cannot issue a second refund. LangChain offers higher-level agent tools built on LangGraph. LangGraph can also be used directly.'],
    ],
    question: 'What needs to survive the overnight wait?',
    answer: 'The order, amount, request identifier, approval status and pending step. Repeating the conversation from memory would lose the record of what was approved.',
    resources: ['res-langgraph'],
  },
  {
    id: 'graphs', title: 'WTF is graph engineering?', group: 'Working with data',
    introduction: 'A graph stores things and the relationships between them. In a course catalogue, each course can be a point, called a node. An arrow labelled “requires” connects one course to a prerequisite.',
    sections: [
      ['Start with a question', '“What must I learn before model training?” gives you a design to work backwards from. Record Training → requires → Data preparation and Data preparation → requires → Python. Following two arrows finds an indirect prerequisite. A spreadsheet is often sufficient for listing courses by name.'],
      ['Keeping the graph trustworthy', 'Give each course a stable ID. Store the source and review date for each prerequisite. Two courses can share a title. Merging them just because their names match can invent a learning path. Check for loops when prerequisites must be completed in order.'],
      ['Three uses of the word graph', 'A knowledge graph records facts and their sources. A workflow graph routes work between steps. A graph neural network learns from connected examples, such as atoms linked by chemical bonds. A database can answer the prerequisite question by following edges without training a model.'],
    ],
    question: 'Python appears two steps away. Does the catalogue say Training directly requires Python?',
    answer: 'It establishes an indirect dependency through Data preparation. Preserve both edges and their sources when explaining the answer.',
    resources: ['res-graph-course'],
  },
  {
    id: 'injection', title: 'WTF is prompt injection?', group: 'Model and data security',
    introduction: 'A model reads instructions and material such as emails or web pages. Prompt injection happens when text steers it away from the task the user authorized. A direct attempt comes from the person messaging the model. An indirect attempt arrives inside something the assistant was asked to read.',
    sections: [
      ['A documented demonstration', 'In 2025, Brave researchers asked the Comet browser assistant to summarize a web page. They showed that instructions embedded in page content could steer the assistant into actions involving another site. This was a researcher demonstration. Its importance is that access to another signed-in site can turn a bad summary into a privacy problem.'],
      ['How to protect the reader', 'Give a summarizer read-only access to the selected page. Keep account credentials outside the conversation. If a different task genuinely requires sharing a file, show its contents and destination for approval. The application must enforce that choice even if the model proposes something else.'],
    ],
    question: 'A document asks your summarizer to send a private note. Who authorized that?',
    answer: 'The user authorized a summary. The document is evidence to read. The harness should deny the send and keep the private note outside the task.',
    resources: ['res-owasp-injection', 'res-brave-report'],
  },
  {
    id: 'jailbreaking', title: 'WTF is jailbreaking?', group: 'Model and data security',
    introduction: 'Jailbreaking is an attempt to make a model disregard its safety rules. The goal distinguishes it from the broader problem of prompt injection, which can also redirect an ordinary task or distort an answer.',
    sections: [
      ['What researchers observed', 'In 2024 Anthropic reported that examples in a long conversation could influence how models responded to later requests, including weakening safety behavior in controlled evaluations. The study describes behavior under test conditions. It does not establish that customer accounts were compromised.'],
      ['What builders can check', 'Evaluate safety across long conversations and after model changes. Record which model and settings you measured. Keep authorization for files, messages and payments outside the model, so an unsafe answer cannot grant access to an account.'],
    ],
    question: 'If a model always declines one unsafe request in testing, can it safely hold a master account credential?',
    answer: 'One evaluation covers a limited set of inputs. Use a narrowly scoped tool outside the conversation and enforce authorization on every call.',
    resources: ['res-jailbreak-study', 'res-owasp-injection'],
  },
  {
    id: 'privacy', title: 'How do I protect my model and my data?', group: 'Model and data security',
    introduction: 'Trace where information goes. A private file might reach a model provider, a saved conversation, a connected tool and an application log. Each copy needs an owner, an access rule and a deletion policy.',
    sections: [
      ['A real service incident', 'On March 20, 2023, a cache-library bug allowed some ChatGPT users to see titles from another active user’s history. OpenAI took the service offline and patched the bug. This was a software isolation failure. Even a perfectly followed prompt would leave that failure in place.'],
      ['Protecting an account', 'Share the smallest excerpt needed. Review connected apps, recipients and saved history. If a secret was exposed, revoke or rotate it at the service that issued it and review access logs. Deleting a chat alone leaves an exposed credential usable.'],
      ['Protecting a model service', 'Restrict access to model weights and checkpoints, verify their source and integrity before loading them, and restrict who can publish a new version. Keep provider keys on the server. Enforce user access before retrieving documents, isolate caches by user, and limit sensitive data in logs.'],
    ],
    question: 'Two users ask the same question about “my invoice”. What makes reusing the first answer unsafe?',
    answer: 'The words match but the authorized records differ. Scope retrieval and cached results to the user and permissions that produced them.',
    resources: ['res-outage'],
  },
];
