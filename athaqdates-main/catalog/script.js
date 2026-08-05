document.getElementById("downloadBtn").addEventListener("click", function() {

```
const filePath = "catalog.pdf"; // yahan apni file ka naam likho

const link = document.createElement("a");
link.href = filePath;
link.download = "Athaq-Dates-Catalog.pdf";

document.body.appendChild(link);
link.click();
document.body.removeChild(link);
```

});
