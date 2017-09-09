import isMobile from 'ismobilejs';

export default function ymapsTouchScroll(map, options = {}) {
  var fullscreenEntered = map.controls.get('fullscreenControl') && map.controls.get('fullscreenControl').isSelected();
  var disableOnFullscreen = options.hasOwnProperty('disableOnFullscreen') && options.disableOnFullscreen && fullscreenEntered;
  var preventMouseScroll = options.hasOwnProperty('preventMouseScroll') && options.preventMouseScroll;
  var desktopText = options.hasOwnProperty('desktopText') ? options.desktopText : 'Чтобы изменить масштаб, прокручивайте карту, удерживая клавишу Ctrl'

  function createEl(elClass, appendBlock, elStyles) {
      const el = document.createElement('div');

      for (const key in elStyles) {
        el.style[key] = elStyles[key];
      }

      el.classList.add(elClass);
      appendBlock.appendChild(el);

      return el;
  }

  var defaultText = 'Чтобы переместить карту проведите по ней двумя пальцами';
  const parentBlock = map.container.getParentElement();

  if (!getComputedStyle(parentBlock).position) parentBlock.style.position = 'relative';

  const mapZIndex = getComputedStyle(map.container.getElement()).zIndex;

  const block = createEl('ymaps-touch-scroll', parentBlock, {
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      zIndex: mapZIndex - 1
  });

  const bg = createEl('ymaps-touch-scroll-bg', block, {
      background: '#000',
      opacity: '0',
      width: '100%',
      height: '100%',
      transition: 'opacity .1s ease-in-out'
  });

  const mapMargin = map.margin.getMargin();
  for (const i in mapMargin) {
      mapMargin[i] += 20;
  }

  const content = createEl('ymaps-touch-scroll-content', block, {
      position: 'absolute',
      top: '50%',
      left: '0',
      transform: 'translateY(-50%)',
      color: '#fff',
      textAlign: 'center',
      width: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      textOverflow: 'ellipsis',
      padding: mapMargin.join('px ') + 'px'
  });

  function blockToggle(show = true) {
      block.style.zIndex = show ? mapZIndex : mapZIndex - 1;
      bg.style.opacity = show ? '.5' : 0;
  }

  if (((!isMobile) || (isMobile && !isMobile.any)) && preventMouseScroll) {
    // Desktop
    content.textContent = desktopText;
    map.events.add('wheel', function (e) {
      if (window.event.ctrlKey === false) {
        e.preventDefault();
        blockToggle();
        setTimeout(function(){
          blockToggle(false);
        }, 1500);
      }
    });
  } else {
    // Mobile
    if (!isMobile || !isMobile.any || disableOnFullscreen || !map.behaviors.isEnabled('multiTouch')) {
      if (!map.behaviors.isEnabled('drag')) {
        map.behaviors.enable('drag');
      }

      return;
    }

    if (options.hasOwnProperty('text')) {
        content.textContent = options.text
    } else {
        content.textContent = defaultText;
    }

    map.behaviors.disable('drag');

    parentBlock.addEventListener('touchmove', () => blockToggle());

    parentBlock.addEventListener('touchend', () => blockToggle(false));
  }
}
