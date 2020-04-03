import React, { useEffect, forwardRef, useRef } from "react";
import { VariableSizeList } from "react-window";
import measureElement, { destroyMeasureLayer } from "./asyncMeasurer";

/**
 * Create the dynamic lists cache object.
 * @param {Object} knownSizes a mapping between an items id and its size.
 */
export const createCache = (knownSizes = {}) => ({
  ...knownSizes
});

/**
 * TL;DR
 * A virtualized list which handles item of varying sizes.
 *
 * This solution is a really naive one, basically we do the following actions:
 * 1. Render the whole list, without windowing!
 * 2. measure all of the cells and cache the size.
 * 3. Remove the list.
 * 4. Render the virtualized list using the cached sizes.
 *
 * Restrictions:
 * This solution will only work in the following cases
 * 1. It is feasible and possible (you have all of the data at hand) to load the data at the beginning for a brief time.
 * 2. Your data doesn't change size
 * 3. You don't add new items to the list (filtering works :))
 * 4. Currently this only supports vertical layout. (didn't have time to implement support for horizontal)
 *
 * Requirements:
 * In order for the cache to work each item in your data set must have an id which isn't based on
 * the items index (or else filtering will fail).
 */
const DynamicList = (
  {
    children,
    data,
    height,
    width,
    cache,
    lazyMeasurement = true,
    onRefSet = () => {},
    layout = "vertical",
    ...variableSizeListProps
  },
  ref
) => {
  const localRef = useRef();
  const listRef = ref || localRef;

  /**
   * Measure a specific item.
   * @param {number} index The index of the item in the data array.
   */
  const measureIndex = index => {
    const WrappedItem = (
      <div style={{ width, height, overflowY: "auto" }}>
        <div style={{ overflow: "auto" }}>{children({ index })}</div>
      </div>
    );
    const { height: measuredHeight } = measureElement(WrappedItem);
    return measuredHeight;
  };

  /**
   * Measure all of the items in the background.
   * This could be a little tough in the site in the first seconds however it allows
   * fast jumping.
   */
  const lazyCacheFill = () => {
    data.forEach(({ id }, index) => {
      setTimeout(() => {
        if (!cache[id]) {
          const height = measureIndex(index);

          // Double check in case the main thread already populated this id
          if (!cache[id]) {
            cache[id] = height;
          }
        }
      }, 0);
    });
  };

  /**
   * Set up measuring layer
   */
  useEffect(() => {
    if (lazyMeasurement) {
      lazyCacheFill();
    }
    return destroyMeasureLayer;
  }, []);

  /**
   * In case the data length changed we need to reassign the current size to all of the indexes.
   */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [data.length]);

  const itemSize = index => {
    const { id } = data[index];
    if (cache[id]) {
      return cache[id];
    } else {
      const height = measureIndex(index);
      cache[id] = height;
      return height;
    }
  };

  return (
    <VariableSizeList
      layout={layout}
      ref={listRef}
      itemSize={itemSize}
      height={height}
      width={width}
      itemCount={data.length}
      {...variableSizeListProps}
    >
      {children}
    </VariableSizeList>
  );
};

export default forwardRef(DynamicList);
