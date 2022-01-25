import { StructureSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface BaseToolbarButtonSpec<I extends BaseToolbarButtonInstanceApi> {
  enabled?: boolean;
  tooltip?: string;
  icon?: string;
  text?: string;
  onSetup?: (api: I) => (api: I) => void;
}

export interface BaseToolbarButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
}

export interface ToolbarButtonSpec extends BaseToolbarButtonSpec<ToolbarButtonInstanceApi> {
  type?: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface ToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface BaseToolbarButton<I extends BaseToolbarButtonInstanceApi> {
  enabled: boolean;
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  onSetup: (api: I) => (api: I) => void;
}

export interface ToolbarButton extends BaseToolbarButton<ToolbarButtonInstanceApi> {
  type: 'button';
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

export const baseToolbarButtonFields = [
  ComponentSchema.disabled,
  ComponentSchema.optionalTooltip,
  ComponentSchema.optionalIcon,
  ComponentSchema.optionalText,
  ComponentSchema.onSetup
];

export const toolbarButtonSchema = StructureSchema.objOf([
  ComponentSchema.type,
  ComponentSchema.onAction
].concat(baseToolbarButtonFields));

export const createToolbarButton = (spec: ToolbarButtonSpec): Result<ToolbarButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('toolbarbutton', toolbarButtonSchema, spec);
