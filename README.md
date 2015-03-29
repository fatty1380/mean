ngSignaturePad
===

[SignaturePad](https://github.com/szimek/signature_pad) as an angularJS directive

![Example](https://f.cloud.github.com/assets/9873/268046/9ced3454-8efc-11e2-816e-a9b170a51004.png)

Install
===

```bash
bower install -S ngSignaturePad
```
    
Include the script tags

```html
<link rel="stylesheet" href="bower_components/ngSignaturePad/ngSignaturePad.min.css"></script>
<script src="bower_components/signature_pad/signature_pad.js"></script>
<script src="bower_components/ngSignaturePad/ngSignaturePad.min.js"></script>
```

Use the directive somewhere in your html as an *attribute*

```html
<div signature-pad signature="myThings.mySignatureModel" close="myThings.myCloseFunction()"></div>
```

Then add the module to your list of angular dependencies as `ngSignaturePad`

```javascript
angular.module('myApp', [
  '...'
  , 'ngSignaturePad'
  ])
```
