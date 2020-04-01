# react-window-dynamic-list

> Made with the awesome [create-react-library](https://github.com/transitive-bullshit/create-react-library)

[![NPM](https://img.shields.io/npm/v/react-window-dynamic-list.svg)](https://www.npmjs.com/package/react-window-dynamic-list) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## How is this different from `react-window`?
This library comes to partly solve the case of rendering dynamically sized items with [react-window](https://github.com/bvaughn/react-window).
Fore more information about the issue please read [this thread](https://github.com/bvaughn/react-window/issues/6).
Before you overjoy please read the [limitations](#requirements-and-limitations) of this approach down bellow :sleepy:

#### Demo
👉 [check out demo page to see dynamic list in action](https://gnir-work.github.io/react-window-dynamic-list/)

## Install

```bash
npm install --save react-window-dynamic-list
```

## Usage
![Usage Preview](docs/carbon.png)


## Implementations details
This solution is a really naive one, basically we do the following actions:
1. Render the whole list, without windowing!
2. measure all of the cells and cache the size.
3. Remove the list.
4. Render the virtualized list using the cached sizes.

## :warning: Requirements and Limitations :warning:
#### Restrictions:
1. It is feasible and possible (you have all of the data at hand) to load the data at the beginning for a brief time.
2. Your data doesn't change its size
3. You don't add new items to the list (filtering work :smirk:)
4. Currently this only supports vertical layout. (didn't have time to implement support for horizontal)
 
#### Requirements:
1. Each item in the data set must have a unique id.

## License

MIT © [gnir-work](https://github.com/gnir-work)
