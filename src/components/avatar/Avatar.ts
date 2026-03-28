import { Block } from '../../framework/Block';
import './avatar.scss';

interface AvatarProps {
  letter?: string;
  className?: string;
  editable?: boolean;
}

export class Avatar extends Block<AvatarProps> {
  static componentName = 'Avatar';

  protected template = `
    {{#if editable}}
    <label class="avatar-lg">
      <span>{{#if letter}}{{letter}}{{else}}?{{/if}}</span>
      <div class="avatar-lg__overlay">Загрузить</div>
      <input class="avatar-lg__input" type="file" name="avatar" accept="image/*" />
    </label>
    {{else}}
    <div class="{{#if className}}{{className}}{{else}}avatar{{/if}}">
      {{#if letter}}{{letter}}{{else}}?{{/if}}
    </div>
    {{/if}}
  `;
}
