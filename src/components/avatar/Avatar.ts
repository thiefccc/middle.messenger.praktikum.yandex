import { Block } from '../../framework/Block';
import './avatar.scss';

interface AvatarProps {
  letter?: string;
  src?: string;
  className?: string;
  editable?: boolean;
}

export class Avatar extends Block<AvatarProps> {
  static componentName = 'Avatar';

  protected template = `
    {{#if editable}}
    <label class="avatar-lg">
      {{#if src}}
        <img class="avatar-lg__image" src="{{src}}" alt="avatar" />
      {{else}}
        <span>{{#if letter}}{{letter}}{{else}}?{{/if}}</span>
      {{/if}}
      <div class="avatar-lg__overlay">Загрузить</div>
      <input class="avatar-lg__input" type="file" name="avatar" accept="image/*" />
    </label>
    {{else}}
    <div class="{{#if className}}{{className}}{{else}}avatar{{/if}}">
      {{#if src}}
        <img class="avatar__image" src="{{src}}" alt="avatar" />
      {{else}}
        {{#if letter}}{{letter}}{{else}}?{{/if}}
      {{/if}}
    </div>
    {{/if}}
  `;
}
