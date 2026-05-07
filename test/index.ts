import { testField, createFieldContext } from "@lark-opdev/block-basekit-server-api";

async function run() {
    const context = await createFieldContext();
    testField({
        prompt: 'Generate a clean product-style illustration based on the references.',
        referenceImages: [],
    }, context);
}

run();
