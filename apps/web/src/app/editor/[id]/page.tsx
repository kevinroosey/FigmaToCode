import getCodeById, { modifyCodeWithAnthropic } from "./actions";
import EditorShell from "@/components/editor-shell";

export default async function Editor({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await the promise and destructure params safely
    const { id } = await params;

    // Get the code safely
    const codeQuery = await getCodeById(id);
    const originalCode = codeQuery?.code;

    // Check if the originalCode exists before modifying it
    if (!originalCode) {
        throw new Error("Code not found for the given ID.");
    }

    const modifiedCode = await modifyCodeWithAnthropic(originalCode);

    if (!modifiedCode) {
        throw new Error("Error modifying the code with Anthropic.");
    }

    return (
        <div className="w-full h-screen flex bg-neutral-900">
            <EditorShell initialCode={modifiedCode} />
        </div>
    );
}


