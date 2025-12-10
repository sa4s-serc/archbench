# Architecture Traceability Link Recovery (TLR) - Example

This example demonstrates the four types of traceability tasks in our benchmark using the JabRef project as a reference.

## Task 1: Documentation to Component Model TLR

**Input: Architecture Documentation (SAD)**
```plain
We have been successfully transitioning from a spaghetti to a more structured architecture with the model in the center, and the logic as an intermediate layer towards the gui which is the outer shell.
There are additional utility packages for preferences and the cli.
```

**Input: Architecture Component Model (UML)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<uml:Model xmi:version="20131001" xmlns:xmi="http://www.omg.org/spec/XMI/20131001" xmlns:uml="http://www.eclipse.org/uml2/5.0.0/UML" xmi:id="__nu3UEl3Ee243f2e4VWs6w" name="JabRef">
  <packagedElement xmi:type="uml:Component" xmi:id="_EBiwMEl4Ee243f2e4VWs6w" name="cli"/>
  <packagedElement xmi:type="uml:Component" xmi:id="_Coy0kEl4Ee243f2e4VWs6w" name="gui"/>
  <packagedElement xmi:type="uml:Component" xmi:id="_MFIzMEl4Ee243f2e4VWs6w" name="model"/>
  <packagedElement xmi:type="uml:Component" xmi:id="_He3LoEl4Ee243f2e4VWs6w" name="logic"/>
  <packagedElement xmi:type="uml:Component" xmi:id="_KsOfgEl4Ee243f2e4VWs6w" name="globals"/>
  <packagedElement xmi:type="uml:Component" xmi:id="_NUdtEEl4Ee243f2e4VWs6w" name="preferences"/>
</uml:Model>
```

**Expected Output: Trace Links (CSV)**
```csv
modelElementID,sentence
_MFIzMEl4Ee243f2e4VWs6w,1
_He3LoEl4Ee243f2e4VWs6w,1
_Coy0kEl4Ee243f2e4VWs6w,1
_NUdtEEl4Ee243f2e4VWs6w,2
_EBiwMEl4Ee243f2e4VWs6w,2
```

---

## Task 2: Component Model to Code TLR

**Input: Architecture Component Model**
```xml
<packagedElement xmi:type="uml:Component" xmi:id="_He3LoEl4Ee243f2e4VWs6w" name="logic"/>
<packagedElement xmi:type="uml:Component" xmi:id="_Coy0kEl4Ee243f2e4VWs6w" name="gui"/>
```

**Input: Code Model (ACM)**
```json
{
  "codeItemRepository": {
    "repository": {
      "acm001340jsd": {
        "type": "CodePackage",
        "id": "acm001340jsd", 
        "name": "logic",
        "parentId": "acm001339jsd",
        "pathElements": ["src", "main", "java", "org", "jabref", "logic"]
      },
      "acm001428jsd": {
        "type": "CodePackage",
        "id": "acm001428jsd",
        "name": "gui", 
        "parentId": "acm001339jsd",
        "pathElements": ["src", "main", "java", "org", "jabref", "gui"]
      }
    }
  }
}
```

**Expected Output: Trace Links (CSV)**
```csv
ae_id,ce_id
_He3LoEl4Ee243f2e4VWs6w,src/main/java/org/jabref/logic/
_Coy0kEl4Ee243f2e4VWs6w,src/main/java/org/jabref/gui/
```

---

## Task 3: Documentation to Code TLR (Direct)

**Input: Architecture Documentation**
```plain
The gui component provides the user interface for the application.
The logic layer handles business rules and data processing.
```

**Input: Source Code Structure**
```
src/main/java/org/jabref/
├── gui/
│   ├── MainFrame.java
│   └── dialogs/
└── logic/
    ├── bibtex/
    └── importer/
```

**Expected Output: Trace Links (CSV)**
```csv
sentenceID,codeID
1,src/main/java/org/jabref/gui/
2,src/main/java/org/jabref/logic/
```

---

## Task 4: Documentation to Code TLR with Intermediate Model (TransArC)

This task combines all three artifacts to perform **transitive traceability** - linking documentation sentences to code artifacts using architecture component models as intermediates.

**LLM Component Name Extraction Process:**

1. **Extract from Documentation:**
```
Input: "The model is in the center, with logic as intermediate layer towards gui"
LLM Output: ["model", "logic", "gui"]
```

2. **Create Simple SAM:**
```xml
<uml:Model name="LLM-Generated">
  <component name="model"/>
  <component name="logic"/> 
  <component name="gui"/>
</uml:Model>
```

3. **Apply TransArC Pipeline:**
   - Phase 1: Documentation → LLM-generated SAM
   - Phase 2: LLM-generated SAM → Source Code
   - Result: Transitive Documentation → Code links

**Final Expected Output:**
```csv
sentenceID,codeID
1,src/main/java/org/jabref/model/
1,src/main/java/org/jabref/logic/
1,src/main/java/org/jabref/gui/
```

## Evaluation Metrics

All tasks are evaluated using:
- **Precision**: Correctly identified links / Total identified links
- **Recall**: Correctly identified links / Total actual links  
- **F1-Score**: Harmonic mean of precision and recall
- **Weighted Average F1**: F1-score weighted by number of expected links per project

## Key Insights from the Paper

The research shows that:
1. **GPT-4o** achieved 0.86 weighted average F1-score using SAD-extracted component names
2. **TransArC with manual SAMs** achieved 0.87 weighted average F1-score  
3. **Direct SAD-to-Code approaches** (like ArDoCode) achieved only 0.62 weighted average F1-score
4. **LLM-extracted component names** make TransArC practically applicable without manual SAM creation

This demonstrates that LLMs can effectively bridge the semantic gap between architecture documentation and source code through automated component name extraction.