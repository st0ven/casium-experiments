import "./App.scss";
import styles from "./App.module.scss";
import { SortableList } from "./containers/sortable-list";

// sample data item to be populated in <SortableList/>
const listData = ["list item A", "list item B", "list item C", "list item D", "list item E"];

function App() {
  return (
    <div className="App">
      <div className={styles["list-container"]}>
        <SortableList items={listData} />
      </div>
    </div>
  );
}

export default App;
