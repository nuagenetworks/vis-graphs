import objectPath from "object-path"

const icons = {
  'nsGatewayBlue': 'icon-nsgateway-blue-26x26.png',
  'nsGatewayRed': 'icon-nsgateway-red-26x26.png',
  'nsGatewayYellow': 'icon-nsgateway-yellow-26x26.png',
  'nsGatewayGrey': 'icon-nsgateway-grey-26x26.png',
  'nsGatewayGreen': 'icon-nsgateway-green-26x26.png'
};

const defaultIcon = 'nsGatewayGreen';
const defaultUrgency = 'GREEN';

export default (iconKey = null, data = []) => {

  /**
   * get path of the image by key
   *const iconKey = {
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

    if (iconKey && typeof iconKey === "object") {
      if (iconKey.criteria) {
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
