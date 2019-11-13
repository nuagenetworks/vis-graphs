import React from 'react';
import objectPath from 'object-path';
import evalExpression from 'eval-expression';

const icons = {
  'nsGatewayBlue': 'icon-nsgateway-blue-26x26.png',
  'nsGatewayRed': 'icon-nsgateway-red-26x26.png',
  'nsGatewayYellow': 'icon-nsgateway-yellow-26x26.png',
  'nsGatewayGrey': 'icon-nsgateway-grey-26x26.png',
  'nsGatewayGreen': 'icon-nsgateway-green-26x26.png'
};

const svgIcons = {
  default: {
    IconSvg: ({color}) => (
        <polyline
            fill={color}
            points="107.62,156.5 1938.33,156.5 1938.33,1021.41 1592.3,1021.41 1592.3,1173.65 1480.65,1173.65 1480.65,1334.29 565.3,1326.64 565.3,1177.48 450.18,1175.55 457.05,1025.71 107.62,1025.71 "
        />
    ),
    viewBox: "107.618 156.5 1830.713 1629.989"
  },
  Wireless: {
    IconSvg: ({color}) => (
        <g id="Layer_2" data-name="Layer 2">
          <g id="Layer_1-2" data-name="Layer 1">
            <path fill={color} d="M454.968,160.667c-0.175-0.257-0.374-0.498-0.595-0.719C393.884,99.46,313.461,66.147,227.919,66.147
			c-85.537,0-165.953,33.306-226.439,93.788c-0.94,0.933-1.48,2.21-1.48,3.552c0,1.326,0.526,2.598,1.465,3.536l33.113,33.114
			c0.938,0.938,2.209,1.464,3.535,1.464c1.326,0,2.598-0.527,3.535-1.464c49.836-49.839,115.988-77.285,186.271-77.285
			c70.282,0,136.434,27.447,186.271,77.284c0.938,0.938,2.209,1.464,3.534,1.464c1.326,0,2.599-0.527,3.535-1.464l33.113-33.114
			c0.938-0.938,1.465-2.209,1.465-3.536C455.839,162.481,455.534,161.499,454.968,160.667z"/>
            <path fill={color} d="M227.919,153.719c-62.056,0-120.461,24.231-164.458,68.229c-1.952,1.953-1.952,5.119,0.001,7.071l33.01,33.009
			c0.938,0.938,2.209,1.465,3.535,1.465c1.326,0,2.598-0.527,3.535-1.465c33.277-33.277,77.448-51.605,124.377-51.605
			c46.931,0,91.102,18.328,124.376,51.605c0.938,0.938,2.21,1.465,3.536,1.465s2.598-0.527,3.535-1.465l33.011-33.009
			c0.938-0.938,1.465-2.209,1.465-3.536c0-1.327-0.525-2.598-1.465-3.536C348.38,177.951,289.975,153.719,227.919,153.719z"/>
            <path fill={color} d="M227.919,241.292c-38.701,0-75.126,15.11-102.564,42.549c-0.939,0.938-1.465,2.209-1.465,3.537
			c0,1.326,0.525,2.598,1.465,3.535l33.01,33.01c0.938,0.938,2.209,1.465,3.535,1.465s2.598-0.527,3.535-1.465
			c16.719-16.719,38.909-25.926,62.484-25.926s45.767,9.209,62.485,25.926c0.938,0.938,2.209,1.465,3.534,1.465
			s2.598-0.527,3.535-1.465l33.01-33.01c1.952-1.953,1.952-5.119,0-7.07C303.046,256.402,266.621,241.292,227.919,241.292z"/>
            <path fill={color} d="M227.919,334.083c-13.521,0-26.229,5.264-35.784,14.822c-1.952,1.953-1.952,5.118,0.001,7.07l32.248,32.25
			c0.938,0.938,2.209,1.465,3.535,1.465s2.599-0.527,3.535-1.465l32.248-32.25c1.952-1.953,1.952-5.118,0-7.071
			C254.146,339.347,241.438,334.083,227.919,334.083z"/>
          </g>
        </g>),
    viewBox: "0 0 455.838 455.838"
  },
  LTE: {
    IconSvg: ({color}) => (
        <g>
          <path fill={color} d="M12,10c-1.106,0-2,0.897-2,2c0,0.737,0.404,1.375,1,1.723V22h2v-8.277c0.596-0.348,1-0.986,1-1.723    C14,10.897,13.104,10,12,10z"/>
          <path fill={color} d="M6.343,6.342L4.929,4.928c-3.899,3.899-3.899,10.244,0,14.143l1.414-1.414    C3.224,14.538,3.224,9.462,6.343,6.342z" />
          <path fill={color} d="M19.07,4.928l-1.414,1.414C19.168,7.854,20,9.863,20,12c0,2.137-0.832,4.145-2.344,5.656l1.414,1.414    C20.959,17.182,22,14.671,22,12C22,9.329,20.959,6.817,19.07,4.928z" />
          <path fill={color} d="M7.758,7.757C6.625,8.891,6,10.397,6,12c0,1.602,0.625,3.109,1.758,4.242l1.414-1.415    C8.416,14.073,8,13.069,8,12c0-1.068,0.416-2.073,1.172-2.828L7.758,7.757z" />
          <path fill={color} d="M16.242,7.757l-1.414,1.415C15.584,9.927,16,10.932,16,12c0,1.068-0.416,2.072-1.172,2.827l1.414,1.415    C17.375,15.11,18,13.602,18,12C18,10.397,17.375,8.891,16.242,7.757z"/>
        </g>
    ),
    viewBox: "0 0 22 22"
  }
};


const defaultIcon = 'nsGatewayGreen';
const defaultUrgency = 'GREEN';

export default (iconKey = null, data = [], svg = false) => {

  /**
   * get path of the image by key
   *const iconKey = {
        "default": "nsGatewayGreen"
   *    criteria : [
   *        {
                "icon": "icon1",
                "fields": {
                    "nsg.status": "deactivated"
                }
            },
            {
                "icon": "icon2",
                "fields": {
                    "nsg.status": "activated",
                    "nsg.signal": "yellow"
                }
            }
   *    ]
   *  }
   */
  let icon;
  let urgency;

  if (iconKey && typeof iconKey === 'object') {

    if (iconKey.getIcon) {
      const getIconFunction = evalExpression(iconKey.getIcon);
      if (getIconFunction) {
        icon = getIconFunction(data);
      }
    } else if (iconKey.criteria) {

      iconKey.criteria.forEach(d => {
        // if there is no icon selected, browse through the next criteria to match the conditions, if all met, assign the icon
        if(!icon) {
          let counter = 0;
          // match all criteria's field with given data, if matched then pick criteria's icon
          for (let key in d.fields) {
            if(d.fields.hasOwnProperty(key)) {
              const value = objectPath.has(data, key) ? objectPath.get(data, key) : null;
              if ((value || value === 0) && d.fields[key] === value) {
                counter++;
              }
            }
          }

          if (Object.keys(d.fields).length === counter) {
            icon = d.icon;
            if (d.urgency) {
              urgency = d.urgency;
            }
          }
        }
      })
    }

    // if default icon defined in configuration then pick default icon
    if (!icon && iconKey.default)
      icon = iconKey.default;

    if (!urgency && iconKey.defaultUrgency)
      urgency = iconKey.defaultUrgency;


  } else {
    icon = iconKey;
  }

  // if svg = true, then return from above svg object
  if (svg) {
    return svgIcons[icon] || svgIcons['default'];
  }

  if (!icon) {
    icon = defaultIcon;
  }

  if (!urgency) {
    urgency = defaultUrgency;
  }

  return {
    url: `${process.env.PUBLIC_URL}/icons/${icons[icon] || icons[defaultIcon]}`,
    urgency,
  };
}
