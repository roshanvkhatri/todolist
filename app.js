//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

const port = process.env.PORT || 3000


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-roshan:Hello%401224@roshankhatri.9abdj.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = {
  name: {
    type: String,
    required: true,
  },
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcom to you ToDoList",
});
const item2 = new Item({
  name: "Hit the + button to add new",
});
const item3 = new Item({
  name: "<-- Hit this to delete",
});

const defItems = [item1, item2, item3];

const listSchema = {
  name: {
    type: String,
    required: true,
  },
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defItems, function (err) {
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defItems
        });
        list.save();
        setTimeout(() => {
          res.redirect("/" + customListName);
        }, 100);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      };
    };
  });
});

app.post("/", function (req, res) {
  const item = new Item({
    name: req.body.newItem,
  });

  if (req.body.list === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: req.body.list }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + req.body.list);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.list;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server started on port "+ port);
});
