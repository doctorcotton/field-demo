"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAttachmentAsBase64 = downloadAttachmentAsBase64;
async function downloadAttachmentAsBase64(attachment, context, logger) {
    logger.info('Downloading reference image', {
        name: attachment.name,
        mimeType: attachment.type,
        size: attachment.size
    });
    const response = await context.fetch(attachment.tmp_url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
        name: attachment.name,
        mimeType: attachment.type,
        dataBase64: buffer.toString('base64')
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWQtYXR0YWNobWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kYXRhL2Rvd25sb2FkLWF0dGFjaG1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFTQSxnRUFtQkM7QUFuQk0sS0FBSyxVQUFVLDBCQUEwQixDQUM5QyxVQUFnQyxFQUNoQyxPQUFxQixFQUNyQixNQUFjO0lBRWQsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtRQUN6QyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7UUFDckIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1FBQ3pCLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtLQUN0QixDQUFDLENBQUM7SUFFSCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUV6RCxPQUFPO1FBQ0wsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1FBQ3JCLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSTtRQUN6QixVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7S0FDdEMsQ0FBQztBQUNKLENBQUMifQ==