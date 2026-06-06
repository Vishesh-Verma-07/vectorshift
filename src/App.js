import { SubmitButton } from "./submit";
import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";

function App() {
  return (
    <div>
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
