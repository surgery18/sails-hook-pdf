# sails-hook-pdf

[![Dependency Status](https://david-dm.org/surgery18/sails-hook-pdf.svg)](https://david-dm.org/surgery18/sails-hook-pdf)

Pdf hook for [Sails JS](http://sailsjs.org), using [html-pdf](https://github.com/marcbachmann/node-html-pdf)

### Installation

`npm i --save sails-hook-pdf`

### Usage

`sails.hooks.pdf.make(template, data, options, cb)`

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
template       | ((string))          | Relative path from `templateDir` (see "Configuration" below) to a folder containing pdf templates.
data           | ((object))          | Data to use to replace template tokens
options        | ((object))          | Pdf options (right now just output)
cb             | ((function))        | Callback to be run after the pdf is created (or if an error occurs). It will contain the path to the file.

### Templates

Templates are generated using your configured Sails [View Engine](http://sailsjs.org/#!/documentation/concepts/Views/ViewEngines.html), allowing for multiple template engines and layouts.  If Sails Views are disabled, will fallback to EJS templates. To define a new email template, create a new folder with the template name inside your `templateDir` directory, and add an **pdf.ejs** file inside the folder (substituting .ejs for your template engine).

### Example

Given the following **pdf.ejs** file contained in the folder **views/pdfTemplates/testPdf**:

```
<p>Hello <%=a%>!</p>
```

In your app you would run the following command.

```
sails.hooks.pdf.make(
  "testPdf",
  {
    a: "Bob Dole",
  },
  {
    output: 'assets/pdfs/mypdf.pdf'
  },
  function(err) {
    console.log(err || "It worked!");
  }
);
```

will result in creating the pdf.
