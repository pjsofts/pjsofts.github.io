---
description: "DOM exercises"
---


```html
<!DOCTYPE html>
<html>
<head>
  <title>DOM Practice</title>
</head>
<body>
  <h1 id="main-heading">Welcome to DOM Practice</h1>
  <p id="paragraph">This is a paragraph for DOM manipulation.</p>
  <ul id="list">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
  <button id="change-text-btn">Change Text</button>
  <input type="text" id="input-text" placeholder="Enter text here">
</body>
</html>
```

DOM Questions:

1. How can you select the `<h1>` element with id "main-heading" using JavaScript?
2. How can you change the text content of the paragraph `<p>` element with id "paragraph" to "DOM manipulation is fun!"?
3. What property can you use to access the value entered in the text input element with id "input-text"?
4. How can you append a new `<li>` element to the existing `<ul>` element with id "list" containing the text "Item 4"?
5. How do you remove the last item from the `<ul>` element with id "list"?
6. How can you add a CSS class "highlight" to the `<h1>` element with id "main-heading" to change its appearance?
7. How can you retrieve the value of the first item (index 0) in the list with id "list" and display it using `alert()`?
8. How can you hide the paragraph element with id "paragraph" from the page?
9. How do you attach a click event listener to the button element with id "change-text-btn" to change the text content of the paragraph to "Button clicked!" when the button is clicked?
10. How can you get the number of child elements within the `<ul>` element with id "list"?
11. How can you create a new `<div>` element and set its `id` attribute to "new-div"?
12. How do you insert the newly created `<div>` element with id "new-div" before the existing `<ul>` element with id "list"?
13. How can you check if the `<h1>` element with id "main-heading" has the CSS class "highlight" applied to it?
14. How do you change the background color of the body element to "lightblue" using JavaScript?
15. How can you get the value of the selected option from a dropdown `<select>` element with id "dropdown"?
16. How do you prevent the default form submission behavior when a form with id "my-form" is submitted?
17. How can you add a new attribute "target" with value "_blank" to all anchor `<a>` elements on the page?
18. How do you clone the `<ul>` element with id "list" and append it to the body of the document?
19. How can you change the width of the input element with id "input-text" to 300 pixels using JavaScript?
20. How do you remove the attribute "placeholder" from the input element with id "input-text"?

DOM Answers:

1. Answer:
```javascript
const mainHeading = document.getElementById("main-heading");
```

2. Answer:
```javascript
const paragraph = document.getElementById("paragraph");
paragraph.textContent = "DOM manipulation is fun!";
```

3. Answer:
```javascript
const inputText = document.getElementById("input-text").value;
```

4. Answer:
```javascript
const newItem = document.createElement("li");
newItem.textContent = "Item 4";
const list = document.getElementById("list");
list.appendChild(newItem);
```

5. Answer:
```javascript
const list = document.getElementById("list");
list.removeChild(list.lastElementChild);
```

6. Answer:
```javascript
const mainHeading = document.getElementById("main-heading");
mainHeading.classList.add("highlight");
```

7. Answer:
```javascript
const list = document.getElementById("list");
const firstItem = list.children[0].textContent;
alert(firstItem);
```

8. Answer:
```javascript
const paragraph = document.getElementById("paragraph");
paragraph.style.display = "none";
```

9. Answer:
```javascript
const button = document.getElementById("change-text-btn");
button.addEventListener("click", () => {
  const paragraph = document.getElementById("paragraph");
  paragraph.textContent = "Button clicked!";
});
```

10. Answer:
```javascript
const list = document.getElementById("list");
const numberOfItems = list.children.length;
```

11. Answer:
```javascript
const newDiv = document.createElement("div");
newDiv.id = "new-div";
```

12. Answer:
```javascript
const list = document.getElementById("list");
const newDiv = document.createElement("div");
newDiv.id = "new-div";
list.parentNode.insertBefore(newDiv, list);
```

13. Answer:
```javascript
const mainHeading = document.getElementById("main-heading");
const hasHighlightClass = mainHeading.classList.contains("highlight");
```

14. Answer:
```javascript
document.body.style.backgroundColor = "lightblue";
```

15. Answer:
```javascript
const dropdown = document.getElementById("dropdown");
const selectedOption = dropdown.value;
```

16. Answer:
```javascript
const myForm = document.getElementById("my-form");
myForm.addEventListener("submit", (event) => {
  event.preventDefault();
});
```

17. Answer:
```javascript
const anchors = document.getElementsByTagName("a");
for (const anchor of anchors) {
  anchor.setAttribute("target", "_blank");
}
```

18. Answer:
```javascript
const list = document.getElementById("list");
const clonedList = list.cloneNode(true);
document.body.appendChild(clonedList);
```

19. Answer:
```javascript
const inputText = document.getElementById("input-text");
inputText.style.width = "300px";
```

20. Answer:
```javascript
const inputText = document.getElementById("input-text");
inputText.removeAttribute("placeholder");
```
