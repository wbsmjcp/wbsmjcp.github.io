# Ideas
* ~Box creator - drop-down list, specifies what type of box is wanted, and if it should use the default stylisation~
* LaTeX fixer - Is this needed? Is there something online that can do this better already?
* Image/Table to text - Rather than always asking AI to fix this and wasting credits/tokens/water etc.
* Reference list sorter - Something that allows pasting a reference list in, which then correctly formats the HTML and orders the pasted list. (Could call it Hillbert) - not sure how useful this would be. Still requires some initial formatting from the team to be worthwhile? How will it know if something is a book vs a web page for example?
* Move the posterframe creator app to a JS script - one for discussion with Dan? Could be something academics can use themselves to create thumbnails.
* Examples/frameworks collector - Upload a lesson draft, PowerPoint draft, pdf, etc and it creates a table of all the theories, examples, references, frameworks etc in a lesson. Perhaps even adds it to a master table. This is most likely going to need to be on Copilot Studio and can be linked to a database? Could be searchable by the team.
* Lesson overview calculator + parser? - Rather than a confusing spreadsheet, it could be something online, maybe even allowing PDF upload and have it auto-detect where activities are placed

---

# Changes and fixes

## Overall
* Move over to using a consistent style sheet for all tools, rather than individually embedding it within each html doc.
* Version history - wonder if there's a better way to host version history changes on the tools. Perhaps a MD file which can just be updated?
* update the colours and design - more WBS dark blue than light blue - maybe a few other things too...
* Add a Project folder in Claude and link github better so I can push/pull better
* Might be convuluted and unnecessary - could add a button/contact so that people can report bugs, feature requests, ideas, suggestions
* Layout changes across the board - rather than being left side bar heavy, would it make more sense to have controls across the top?

## Petrock - Otter transcription fixer
* Consider adding in slide references when slides change
* Need to change the order of the buttons at the bottom (I can do that... not Claude), probably want COPY HTML to be the last button.
* Add version number
* Remove 'Transcribed by Otter AI' default text when using Clipboard (also check txt/docx for formatting removing)
* Filter out timestamps, should someone have copied or exported with time stamps enabled. (Maybe this is a button that can be pressed)
* Auto-Check for unlabelled speakers

## Varnisher - Parser and fixer for my.wbs source code
* Add in template boxes for fixing issues with those

## Southpaw - Box template creator
* Add more CSS from my.wbs to improve previews (generic div box)
* Fix ligatures in the boxes so they don't happen in future
* Add option to tidy and correct prior box templates (or integrate into the Varnisher)
* Add image files for non FA icon templates
* Add upload file option for icons, with specifications for good image dimensions and properties.
* Add auto-detect of pasted content (e.g. grab a title, select a box type, identify the box number if it exists)
* Add standard wording for certain boxes and a tick box for 'gating' disclaimer.

## Tafelburg - A Table creator
* Fix previews
* change boxes to be side by side and not stacked (reducing scroll) - should stack if screen width is significantly reduced
* Tick option to allow header rows to be text centre aligned

