"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVisionDraft = runVisionDraft;
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const constants_1 = require("../constants");
const fetch_relay_1 = require("../data/fetch-relay");
const download_attachment_1 = require("../data/download-attachment");
const image_format_1 = require("../domain/image-format");
function previewPrompt(prompt) {
    return prompt.slice(0, 100);
}
async function runVisionDraft(params, context, logger) {
    const prompt = (params.prompt || '').trim();
    const referenceImages = Array.isArray(params.referenceImages)
        ? params.referenceImages
        : [];
    if (!prompt) {
        return {
            code: block_basekit_server_api_1.FieldCode.ConfigError,
            msg: 'prompt is required'
        };
    }
    if (!referenceImages.length) {
        return {
            code: block_basekit_server_api_1.FieldCode.ConfigError,
            msg: 'reference images are required'
        };
    }
    const unsupported = referenceImages.find((attachment) => !(0, image_format_1.isSupportedInputMimeType)(attachment.type));
    if (unsupported) {
        return {
            code: block_basekit_server_api_1.FieldCode.InvalidArgument,
            msg: `unsupported mime type: ${unsupported.type}; supported=${constants_1.SUPPORTED_INPUT_MIME_TYPES.join(',')}`
        };
    }
    const relayReferenceImages = [];
    for (const attachment of referenceImages) {
        relayReferenceImages.push(await (0, download_attachment_1.downloadAttachmentAsBase64)(attachment, context, logger));
    }
    logger.info('Calling relay API', {
        promptPreview: previewPrompt(prompt),
        referenceImageCount: relayReferenceImages.length
    });
    const relayResult = await (0, fetch_relay_1.fetchRelayImages)({
        prompt,
        referenceImages: relayReferenceImages
    }, context, logger);
    if (relayResult.ok === false) {
        const relayCode = relayResult.body?.error?.code;
        const relayMessage = relayResult.body?.error?.message ?? relayResult.rawText;
        if (relayResult.status === 401 || relayResult.status === 403) {
            return {
                code: block_basekit_server_api_1.FieldCode.AuthorizationError,
                msg: relayMessage
            };
        }
        if (relayResult.status === 429 || relayCode === 'RATE_LIMIT') {
            return {
                code: block_basekit_server_api_1.FieldCode.RateLimit,
                msg: relayMessage
            };
        }
        if (relayCode === 'QUOTA_EXHAUSTED') {
            return {
                code: block_basekit_server_api_1.FieldCode.QuotaExhausted,
                msg: relayMessage
            };
        }
        if (relayResult.status >= 400 && relayResult.status < 500) {
            return {
                code: block_basekit_server_api_1.FieldCode.InvalidArgument,
                msg: relayMessage
            };
        }
        return {
            code: block_basekit_server_api_1.FieldCode.Error,
            msg: relayMessage
        };
    }
    const images = relayResult.body.images
        .slice(0, constants_1.MAX_OUTPUT_IMAGES)
        .filter((image) => image.url);
    if (!images.length) {
        return {
            code: block_basekit_server_api_1.FieldCode.InvalidArgument,
            msg: 'relay returned no images'
        };
    }
    const oversizeImage = images.find((image) => typeof image.sizeBytes === 'number' &&
        image.sizeBytes > constants_1.MAX_OUTPUT_IMAGE_SIZE_BYTES);
    if (oversizeImage) {
        return {
            code: block_basekit_server_api_1.FieldCode.InvalidArgument,
            msg: `relay image too large: ${oversizeImage.name}`
        };
    }
    const attachments = images.map((image, index) => ({
        name: (0, image_format_1.ensureImageFileName)(image.name || `vision-draft-${index + 1}`, image.mimeType),
        content: image.url,
        contentType: 'attachment/url',
        width: image.width,
        height: image.height
    }));
    return {
        code: block_basekit_server_api_1.FieldCode.Success,
        data: attachments
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLXZpc2lvbi1kcmFmdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91c2VjYXNlcy9ydW4tdmlzaW9uLWRyYWZ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBZ0NBLHdDQTJIQztBQTNKRCxtRkFBaUU7QUFDakUsNENBSXNCO0FBQ3RCLHFEQUF1RDtBQUN2RCxxRUFBeUU7QUFDekUseURBQXVGO0FBb0J2RixTQUFTLGFBQWEsQ0FBQyxNQUFjO0lBQ25DLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQ2xDLE1BQXFCLEVBQ3JCLE9BQXVCLEVBQ3ZCLE1BQWM7SUFFZCxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQzNELENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZTtRQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDO0lBRVAsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1osT0FBTztZQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLFdBQVc7WUFDM0IsR0FBRyxFQUFFLG9CQUFvQjtTQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsT0FBTztZQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLFdBQVc7WUFDM0IsR0FBRyxFQUFFLCtCQUErQjtTQUNyQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQ3RDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUEsdUNBQXdCLEVBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUMzRCxDQUFDO0lBQ0YsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNoQixPQUFPO1lBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsZUFBZTtZQUMvQixHQUFHLEVBQUUsMEJBQTBCLFdBQVcsQ0FBQyxJQUFJLGVBQWUsc0NBQTBCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1NBQ3JHLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFDaEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUN6QyxvQkFBb0IsQ0FBQyxJQUFJLENBQ3ZCLE1BQU0sSUFBQSxnREFBMEIsRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUM5RCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7UUFDL0IsYUFBYSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFDcEMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsTUFBTTtLQUNqRCxDQUFDLENBQUM7SUFFSCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOEJBQWdCLEVBQ3hDO1FBQ0UsTUFBTTtRQUNOLGVBQWUsRUFBRSxvQkFBb0I7S0FDdEMsRUFDRCxPQUFPLEVBQ1AsTUFBTSxDQUNQLENBQUM7SUFFRixJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDN0IsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDO1FBQ2hELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQzdFLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUM3RCxPQUFPO2dCQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLGtCQUFrQjtnQkFDbEMsR0FBRyxFQUFFLFlBQVk7YUFDbEIsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsS0FBSyxZQUFZLEVBQUUsQ0FBQztZQUM3RCxPQUFPO2dCQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLFNBQVM7Z0JBQ3pCLEdBQUcsRUFBRSxZQUFZO2FBQ2xCLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxTQUFTLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztZQUNwQyxPQUFPO2dCQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLGNBQWM7Z0JBQzlCLEdBQUcsRUFBRSxZQUFZO2FBQ2xCLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQzFELE9BQU87Z0JBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsZUFBZTtnQkFDL0IsR0FBRyxFQUFFLFlBQVk7YUFDbEIsQ0FBQztRQUNKLENBQUM7UUFDRCxPQUFPO1lBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsS0FBSztZQUNyQixHQUFHLEVBQUUsWUFBWTtTQUNsQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTTtTQUNuQyxLQUFLLENBQUMsQ0FBQyxFQUFFLDZCQUFpQixDQUFDO1NBQzNCLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkIsT0FBTztZQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLGVBQWU7WUFDL0IsR0FBRyxFQUFFLDBCQUEwQjtTQUNoQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQy9CLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDUixPQUFPLEtBQUssQ0FBQyxTQUFTLEtBQUssUUFBUTtRQUNuQyxLQUFLLENBQUMsU0FBUyxHQUFHLHVDQUEyQixDQUNoRCxDQUFDO0lBQ0YsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNsQixPQUFPO1lBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsZUFBZTtZQUMvQixHQUFHLEVBQUUsMEJBQTBCLGFBQWEsQ0FBQyxJQUFJLEVBQUU7U0FDcEQsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBdUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEUsSUFBSSxFQUFFLElBQUEsa0NBQW1CLEVBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxnQkFBZ0IsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDcEYsT0FBTyxFQUFFLEtBQUssQ0FBQyxHQUFHO1FBQ2xCLFdBQVcsRUFBRSxnQkFBZ0I7UUFDN0IsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO1FBQ2xCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtLQUNyQixDQUFDLENBQUMsQ0FBQztJQUVKLE9BQU87UUFDTCxJQUFJLEVBQUUsb0NBQVMsQ0FBQyxPQUFPO1FBQ3ZCLElBQUksRUFBRSxXQUFXO0tBQ2xCLENBQUM7QUFDSixDQUFDIn0=