Libsamplerate.js
========================

This repository provides a build of the samplerate conversion library in JavaScript/wasm.

Install
-------

Using `npm`:

```shell
npm install @toots/libsamplerate.js
```

Using `yarn`:

```shell
yarn add @toots/libsamplerate.js
```

Using `pnpm`:

```shell
pnpm install @toots/libsamplerate.js
```

In a HTML page:

When using `webpack`, the package should point to the correct
`libsamplerate_browser.js` file automatically.

When using directly as a script, you can load the `libsamplerate_node.js`
file as:

```html
<script src="libsamplerate_node.js"></script>
```

How to use?
-----------

The encoding API should be quite straight forward:

```js
import { Samplerate, Converter } from "@toots/libsamplerate.js";

const exec = async () => {
  await Samplerate.initialized;
  
  const resampler = new Samplerate(Converter.FASTEST);

  const result = resampler.process({
    data: buffer, // buffer is a Float32Aray or a Int16Array
    ratio: 1.5,
    last: false
  });

  const converted = result.data; // same type as buffer above
  const used = result.used; // input samples effectively used

  // Close:
  resampler.close();
}

exec();
```

Author
------

Romain Beauxis <toots@rastageeks.org>

Code derived from libmp3lame-js by:
Andreas Krennmair <ak@synflood.at>

License
-------

libsamplerate.js is published under the license terms as samplerate.
