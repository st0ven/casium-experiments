import React from "react";
import Message from "casium/message";
import { container } from "casium";
import styles from "./sortable-list.module.scss";
import { is } from "ramda";
import { ListItem } from "../components/list-item";

// Message to process when an action is invoked to move selected items
// in the list either up or down the list
class ReorderList extends Message {
  static expects = { direction: is(String) };
}

// Message to process resetting the initial state of the list
class ResetListOrder extends Message {}

// Message to process when an item in the list is either checked or unchecked
class ToggleItemSelection extends Message {
  static status = false;
}

// Sortable List Component defined as a Casium Container
export const SortableList = container({
  name: "SortableList",

  init: function () {
    return {
      items: [],
      order: undefined,
      replaceIndex: undefined,
      selectedItems: [],
    };
  },

  update: [
    /*
		Given that the <selectedItems> array is not empty, this message expects either an initial
		list of items to represent the ordered list, or a numeric array of the current order of those
		items, and a <direction> data prop passed to it, representing either "up" or "down" to indicate
		where to place the selectedItems list in the new ordering. A new ordered index list is then returned
		to be set into the container store.
		*/
    [
      ReorderList,
      function (model, { direction }) {
        const { items, order, selectedItems = [] } = model;

        // No need to continue list reorder if there is unmet prerequisite of
        // having items currently selected. Exit callback
        if (!selectedItems.length) {
          return model;
        }

        // Determine a list of indices to use based on either the existing list order
        // or constructed from the original item list ordering if no reordering exists.
        const currentOrder =
          order && order.length
            ? order
            : Object.keys(items).map((n) => parseInt(n));

        // Determine the initial index for which to gauge the reorder operation. This is
        // contingent on the direction of the intended movement. When moving 'up', this index
        // should target the first selected item's location in the indices list, and the
        // last selected item's location when moving 'down'.
        const refIndex = selectedItems.reduce(
          function (acc, value) {
            const index = currentOrder.indexOf(value);

            // The return criteria is whichever is the lowest accumulation value when moving "up",
            // or the highest accumulation value going "down".
            const criteria = direction === "up" ? index < acc : index > acc;

            return criteria && index > -1 ? index : acc;
          },
          // Initial value: Conditional based on direction. We want to set this to a high limit when
          // the direction is 'up', and low when the direction is 'down'.
          direction === "up" ? currentOrder.length : -1
        );

        // Determine an index for where the selected items list should be inserted into
        // a pruned list of indices dependent on the direction of movement.
        let swapIndex =
          direction === "up"
            ? refIndex - 1
            : refIndex + 1 - (selectedItems.length - 1);

        // Bound any movement action to be limited to the size of the indices list
        swapIndex =
          swapIndex < 0
            ? 0
            : swapIndex >= currentOrder.length
            ? currentOrder.length - 1
            : swapIndex;

        // Define two lists, one representing the current order of items that are not in the
        // selection list, and one of the ordered items contained in the selection list.
        // Order is relevant to the current order list state.
        const newIndicesOrder = [];
        const selectedIndicesOrder = [];

        // Iterate through the indices list to sort each item into the proper list defined above.
        for (let index of currentOrder) {
          if (selectedItems.includes(index)) {
            selectedIndicesOrder.push(index);
          } else {
            newIndicesOrder.push(index);
          }
        }

        // Insert the ordered list of selected items at the derived index into the unselected list
        newIndicesOrder.splice(swapIndex, 0, ...selectedIndicesOrder);

        // and update the store with the new list order
        return { ...model, order: newIndicesOrder };
      },
    ],

    /*
		Updates the model to reset both ordering to be undefined as well as emptying the
		selectedItems list. Original ordering and unchecked states for all items should be the end result.
		TODO: figure out how to invoke this in the init() method to set the inigial state of the model.
		*/
    [
      ResetListOrder,
      function (model) {
        return {
          ...model,
          order: undefined,
          selectedItems: [],
        };
      },
    ],

    /*
		Requires the current event reference and list item value as data objects passed to this message. 
		Will then seek to grab a reference to the target element/input and derive its unique ID based on
		a data tag attribubte assigned to it during instantiation. This ID is added to the selectedItems 
		list, which controls the 'selected' property, determining the 'checked' status of the udnerlying checkbox.
		*/
    [
      ToggleItemSelection,
      function (model, { event, value }) {
        const { selectedItems } = model;

        // the target element of the event triggering the interaction. This should
        // reference the checkbox input component of the list item
        const { target } = event();

        // Each input element within the react component contains a key property within the
        // custom dataset attribute to uniquely serialize this item in the list
        const serial = parseInt(target.dataset?.serial);

        // Build a new array based on the existing selectedItems within the store
        const selectedItemsUpdated = Array.from(selectedItems);

        // Identify the current location of the target key within the selected items list.
        // Returns -1 if the item is not found in the list.
        const targetKeyIndex = selectedItems.indexOf(serial);

        // TOGGLE ON:
        // Conditionally add the key to the updated selected list if this input was checked
        // and the key was not found in the current selected list.
        if (value && targetKeyIndex === -1) {
          selectedItemsUpdated.push(serial);
        }

        // TOGGLE OFF:
        // Conditionally remove the key from the updated selection list if the input was unchecked
        // and the key existed within the current selected list.
        else if (!value && targetKeyIndex > -1) {
          selectedItemsUpdated.splice(targetKeyIndex, 1);
        }

        // Update the store
        return [{ ...model, selectedItems: selectedItemsUpdated }];
      },
    ],
  ],

  view: function ({ emit, items = [], order, selectedItems }) {
    // Derive a collection of item elements to render in the ordered list.
    const listItemElements = (order || Object.keys(items)).map(
      function renderItem(index) {
        // a reference to the text value of the item to be displayed in the list
        const itemValue = items[index];

        // a unique index which references the original sort order of the item
        // in the original items list prop. This is used to keep a consistent reference
        // to this binding of react element and list item data.
        const itemIndex = items.indexOf(itemValue);

        // Derive the checked state of the corresponding input element of this component.
        const isSelected = selectedItems.includes(itemIndex);

        // JSX to be rendered/injected
        return (
          <ListItem
            key={`list-item-${itemIndex}`}
            onChange={emit([ToggleItemSelection])}
            selected={isSelected}
            serial={itemIndex}
            value={itemValue}
          />
        );
      }
    );

    // Render the list with action buttons
    return (
      <section className={styles["sortable-list-wrapper"]}>
        <ul className={styles["sortable-list"]}>{listItemElements}</ul>
        <div className={styles["button-group"]}>
          <button
            disabled={!selectedItems.length}
            onClick={emit([ReorderList, { direction: "up" }])}
          >
            move up
          </button>
          <button
            disabled={!selectedItems.length}
            onClick={emit([ReorderList, { direction: "down" }])}
          >
            move down
          </button>
          <button disabled={!order && !selectedItems.length} onClick={emit(ResetListOrder)}>
            reset
          </button>
        </div>
      </section>
    );
  },
});
