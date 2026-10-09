# Ideas
* ~Box creator - drop-down list, specifies what type of box is wanted, and if it should use the default stylisation~
* LaTeX fixer - Is this needed? Is there something online that can do this better already?
* Image/Table to text - Rather than always asking AI to fix this and wasting credits/tokens/water etc.
* Reference list sorter - Something that allows pasting a reference list in, which then correctly formats the HTML and orders the pasted list. (Could call it Hillbert) - not sure how useful this would be. Still requires some initial formatting from the team to be worthwhile? How will it know if something is a book vs a web page for example?
* Move the posterframe creator app to a JS script - one for discussion with Dan? Could be something academics can use themselves to create thumbnails.
* Examples/frameworks collector - Upload a lesson draft, PowerPoint draft, pdf, etc and it creates a table of all the theories, examples, references, frameworks etc in a lesson. Perhaps even adds it to a master table. This is most likely going to need to be on Copilot Studio and can be linked to a database? Could be searchable by the team.
* Lesson overview calculator + parser? - Rather than a confusing spreadsheet, it could be something online, maybe even allowing PDF upload and have it auto-detect where activities are placed - PAUSE? DEPENDS ON THE ASYNC PRIORITISATION
* Other publishing tools? Teaching faculty pages etc.
* Unite all the tools under 1 page - each tool can exist as its own individual html file, but one file brings them all together.

---

# Changes and fixes

## Overall
* Move over to using a consistent style sheet for all tools, rather than individually embedding it within each HTML doc.
* Version history - wonder if there's a better way to host version history changes on the tools. Perhaps an MD file which can just be updated?
* update the colours and design - more WBS dark blue than light blue - maybe a few other things too...
* Add a Project folder in Claude and link GitHub better so I can push/pull better
* Might be convoluted and unnecessary - could add a button/contact so that people can report bugs, feature requests, ideas, suggestions
* Layout changes across the board - rather than being left sidebar heavy, would it make more sense to have controls across the top?

## Petrock - Otter transcription fixer
* Consider adding in slide references when slides change
* ~Need to change the order of the buttons at the bottom (I can do that... not Claude), probably want COPY HTML to be the last button.~
* ~Add version number~
* Remove 'Transcribed by Otter AI' default text when using Clipboard (also check txt/docx for formatting removal)
* Filter out timestamps, should someone have copied or exported with time stamps enabled. (Maybe this is a button that can be pressed)
* Auto-Check for unlabelled speakers for interviews (e.g. Speaker 1... ) - how is this being handled currently?
* ~Add a 'clear' button~
* Add support for uploading InDesign files and PDFs - Help to convert old transcripts quickly. 
* Batch mode? - Useful for the above. 
* Ability to alter speaker names - useful for if someone has left 'Speaker 1' instead of names, used initials, someone's name has changed since the transcript was first edited. 
* Rebalance the buttons under the transcripts - Format button could be on the right. Upload button above/before the paste box. Wonder if a drag and drop into the paste box would also be useful. 

## Varnisher - Parser and fixer for my.wbs source code
* Add in template boxes for fixing issues with those
* Add a checker for rogue responsiveness spans `<span class="responsive-iframe-container" style="padding-bottom: 56.25%;">` which are used on text, thus causing a large grey boundary box to appear. 
* Add a check that ensures that tables are surrounded by appropriate div tags and that divs tags aren't closed later than necessary.
* Add a check for when 'table responsiveness' divs aren't being followed by a table. Ensure tables are also enclosed in 'table responsiveness divs'

## Southpaw - Box template creator
* Add more CSS from my.wbs to improve previews (generic div box)
* Fix ligatures in the boxes so they don't happen in future - this might be a hard code issue in my.wbs, CSS stylisation can override - probably best to resolve with devs rather than trying to resolve ourselves. 
* Add tick box for ligatures - default is ON for no ligatures. 
* Add option to tidy and correct prior box templates (or integrate into the Varnisher)
* ~Add image files for non-FA icon templates~
* Fix formatted code for 'TLE icons' so it doesn't use the proposed hard-coded solution that is sent to the devs. 
* Add upload file option for icons, with specifications for good image dimensions and properties.
* ~Add auto-detect of pasted content (e.g. grab a title, select a box type, identify the box number if it exists)~
* Add an 'auto-detect' button should it change - and also remove the 'auto-detected content' from the paste box being included in the final box code and preview.
* Add standard wording for certain boxes and a tick box for 'gating' disclaimer.
* Reconsider the design - improve the UI so that it works more logically. (e.g. the box type/reference number/title boxes could be above the 'paste' box. 
* Move the copy HTML box to the right under the code. 

## Tafelburg - A Table creator
* Fix previews
* change boxes to be side by side and not stacked (reducing scroll) - should stack if screen width is significantly reduced
* Tick option to allow header rows to be text-centred aligned
* Auto create box from context (e.g. if copied from a draft, it can autodetect)

