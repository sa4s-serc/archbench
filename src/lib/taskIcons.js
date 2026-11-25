import { Boxes, FileText, GitBranch, Link2, Network, Radio } from "lucide-react";

// One icon per task, following the live site's set.
export const TASK_ICONS = {
  adr: FileText,
  traceability: Link2,
  diagram: Network,
  serverless: GitBranch,
  dynamic: Radio,
  microservice: Boxes,
};
