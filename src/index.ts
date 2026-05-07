import {
  AuthorizationType,
  basekit,
  FieldCode,
  FieldComponent,
  FieldType,
  field,
  type Authorization
} from '@lark-opdev/block-basekit-server-api';
import { FEISHU_DOMAINS, RELAY_AUTH_ID, RELAY_DOMAINS } from './constants';
import { i18nMessages } from './i18n';
import { getLogger } from './logger';
import { runVisionDraft } from './usecases/run-vision-draft';

const { t } = field;

basekit.addDomainList([...FEISHU_DOMAINS, ...RELAY_DOMAINS]);

const relayAuthorization: Authorization = {
  id: RELAY_AUTH_ID,
  type: AuthorizationType.HeaderBearerToken,
  platform: 'connect_ai',
  required: true,
  label: t('authorizationLabel'),
  instructionsUrl: 'https://visiondraft-api.su121.top',
  icon: {
    light: '',
    dark: ''
  }
};

basekit.addField({
  i18n: {
    messages: i18nMessages
  },
  authorizations: [relayAuthorization],
  formItems: [
    {
      key: 'prompt',
      label: t('promptLabel'),
      component: FieldComponent.Input,
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
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
        placeholder: t('referenceImagesPlaceholder')
      },
      validator: {
        required: true
      }
    }
  ],
  resultType: {
    type: FieldType.Attachment
  },
  execute: async (formItemParams: any, context) => {
    const logger = getLogger('VISION_DRAFT_EXECUTE', context);
    try {
      logger.info('Execution started', {
        hasPrompt: Boolean(formItemParams?.prompt),
        referenceImageCount: Array.isArray(formItemParams?.referenceImages)
          ? formItemParams.referenceImages.length
          : 0
      });

      const result = await runVisionDraft(formItemParams, context as any, logger);
      if (result.code !== FieldCode.Success) {
        logger.warn('Execution finished with non-success code', {
          code: result.code,
          msg: result.msg || ''
        });
      }
      return result;
    } catch (error) {
      logger.error('Execution crashed', {
        error: String(error)
      });
      return {
        code: FieldCode.Error
      };
    }
  }
});

export default basekit;
