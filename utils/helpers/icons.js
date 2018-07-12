import objectPath from "object-path"

const icons = {
    'nsGatewayBlue': 'icon-nsgateway-blue-26x26.png',
    'nsGatewayRed': 'icon-nsgateway-red-26x26.png',
    'nsGatewayYellow': 'icon-nsgateway-yellow-26x26.png'
};

const defaultIcon = 'nsGatewayBlue';

export default (iconKey = null, data = []) => {

    let icon
    if (typeof iconKey === "object") {
      if (iconKey.criteria) {
        iconKey.criteria.forEach(d => {

          let counter = 0
          // match all criteria's field with given data, if matched then pick criteria's icon
          for (let key in d.fields) {
            let value = objectPath.get(data, key)
            if (d.fields.hasOwnProperty(key) && value && d.fields[key] === value) {
              counter++
            }
          }

          if (Object.keys(d.fields).length === counter) {
            icon = d.icon
          }
        })
      }

      // if default icon defined in configuration then pick default icon
      if (!icon && iconKey.default)
        icon = iconKey.default
    } else {
        icon = iconKey
    }

    if(!icon)
        icon = defaultIcon

    return `${process.env.PUBLIC_URL}/icons/${icons[icon] || icons[defaultIcon]}`
}
