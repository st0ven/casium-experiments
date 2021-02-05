import "./App.scss";
import { SortableList } from "./containers/sortable-list";

// sample data item to be populated in <SortableList/>
const listData = ["list item A", "list item B", "list item C", "list item D", "list item E"];

function App() {
  return (
    <div className="App">
      <SortableList items={listData}/>
    </div>
  );
}

export default App;
