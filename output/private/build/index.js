"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const constants_1 = require("./constants");
const i18n_1 = require("./i18n");
const logger_1 = require("./logger");
const run_vision_draft_1 = require("./usecases/run-vision-draft");
const { t } = block_basekit_server_api_1.field;
block_basekit_server_api_1.basekit.addDomainList([...constants_1.FEISHU_DOMAINS, ...constants_1.RELAY_DOMAINS]);
const relayAuthorization = {
    id: constants_1.RELAY_AUTH_ID,
    type: block_basekit_server_api_1.AuthorizationType.HeaderBearerToken,
    platform: 'connect_ai',
    required: true,
    label: t('authorizationLabel'),
    instructionsUrl: 'https://visiondraft-api.su121.top',
    icon: {
        light: '',
        dark: ''
    }
};
block_basekit_server_api_1.basekit.addField({
    i18n: {
        messages: i18n_1.i18nMessages
    },
    authorizations: [relayAuthorization],
    formItems: [
        {
            key: 'prompt',
            label: t('promptLabel'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('promptPlaceholder')
            },
            validator: {
                required: true
            }
        },
        {
            key: 'referenceImages',
            label: t('referenceImagesLabel'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.Attachment],
                placeholder: t('referenceImagesPlaceholder')
            },
            validator: {
                required: true
            }
        }
    ],
    resultType: {
        type: block_basekit_server_api_1.FieldType.Attachment
    },
    execute: async (formItemParams, context) => {
        const logger = (0, logger_1.getLogger)('VISION_DRAFT_EXECUTE', context);
        try {
            logger.info('Execution started', {
                hasPrompt: Boolean(formItemParams?.prompt),
                referenceImageCount: Array.isArray(formItemParams?.referenceImages)
                    ? formItemParams.referenceImages.length
                    : 0
            });
            const result = await (0, run_vision_draft_1.runVisionDraft)(formItemParams, context, logger);
            if (result.code !== block_basekit_server_api_1.FieldCode.Success) {
                logger.warn('Execution finished with non-success code', {
                    code: result.code,
                    msg: result.msg || ''
                });
            }
            return result;
        }
        catch (error) {
            logger.error('Execution crashed', {
                error: String(error)
            });
            return {
                code: block_basekit_server_api_1.FieldCode.Error
            };
        }
    }
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFROEM7QUFDOUMsMkNBQTJFO0FBQzNFLGlDQUFzQztBQUN0QyxxQ0FBcUM7QUFDckMsa0VBQTZEO0FBRTdELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxnQ0FBSyxDQUFDO0FBRXBCLGtDQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRywwQkFBYyxFQUFFLEdBQUcseUJBQWEsQ0FBQyxDQUFDLENBQUM7QUFFN0QsTUFBTSxrQkFBa0IsR0FBa0I7SUFDeEMsRUFBRSxFQUFFLHlCQUFhO0lBQ2pCLElBQUksRUFBRSw0Q0FBaUIsQ0FBQyxpQkFBaUI7SUFDekMsUUFBUSxFQUFFLFlBQVk7SUFDdEIsUUFBUSxFQUFFLElBQUk7SUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO0lBQzlCLGVBQWUsRUFBRSxtQ0FBbUM7SUFDcEQsSUFBSSxFQUFFO1FBQ0osS0FBSyxFQUFFLEVBQUU7UUFDVCxJQUFJLEVBQUUsRUFBRTtLQUNUO0NBQ0YsQ0FBQztBQUVGLGtDQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2YsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFLG1CQUFZO0tBQ3ZCO0lBQ0QsY0FBYyxFQUFFLENBQUMsa0JBQWtCLENBQUM7SUFDcEMsU0FBUyxFQUFFO1FBQ1Q7WUFDRSxHQUFHLEVBQUUsUUFBUTtZQUNiLEtBQUssRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQ3ZCLFNBQVMsRUFBRSx5Q0FBYyxDQUFDLEtBQUs7WUFDL0IsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUM7YUFDcEM7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsaUJBQWlCO1lBQ3RCLEtBQUssRUFBRSxDQUFDLENBQUMsc0JBQXNCLENBQUM7WUFDaEMsU0FBUyxFQUFFLHlDQUFjLENBQUMsV0FBVztZQUNyQyxLQUFLLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFLENBQUMsb0NBQVMsQ0FBQyxVQUFVLENBQUM7Z0JBQ25DLFdBQVcsRUFBRSxDQUFDLENBQUMsNEJBQTRCLENBQUM7YUFDN0M7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsb0NBQVMsQ0FBQyxVQUFVO0tBQzNCO0lBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxjQUFtQixFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzlDLE1BQU0sTUFBTSxHQUFHLElBQUEsa0JBQVMsRUFBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUMvQixTQUFTLEVBQUUsT0FBTyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7Z0JBQzFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztvQkFDakUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTTtvQkFDdkMsQ0FBQyxDQUFDLENBQUM7YUFDTixDQUFDLENBQUM7WUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsaUNBQWMsRUFBQyxjQUFjLEVBQUUsT0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVFLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxvQ0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxFQUFFO29CQUN0RCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7b0JBQ2pCLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUU7aUJBQ3RCLENBQUMsQ0FBQztZQUNMLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ2hDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3JCLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsS0FBSzthQUN0QixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxrQkFBZSxrQ0FBTyxDQUFDIn0=