# splitScroll Plugin



Split screen scrolling with fixed elements in plain javascript.

```html
<!-- Main split scroll wrapper -->
<div class="splitscroll">

    <!-- Left Side -->
    <div class="splitscroll__left">
        <div class="splitscroll__item">
            <div class="splitscroll__mover">nix</div>
        </div>
    </div>

    <!-- Right Side -->
    <div class="splitscroll__right">
        <div class="splitscroll__item">
            <div class="splitscroll__mover">nix</div>
        </div>
    </div>
</div>
```

## start split scroller

```javascript
let splitScroller = null;

document.addEventListener( 'DOMContentLoaded', () => {
    splitScroller = splitScroll();
} );
```

### Options


| option key    | default         | description |
|:--------------|:----------------|:------------|
| `name`        | `'splitscroll'` ||
| `scrollItem`  | `'item'`        ||
| `mover`       | `'mover'`       ||
