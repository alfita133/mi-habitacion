# Recovery protocol
Before editing, read docs/PROJECT_STATE.md, docs/ROADMAP.md, docs/ARCHITECTURE.md, docs/DECISIONS.md, and docs/DATA_MODEL.md in that order. Then inspect git status/log and relevant code. Continue from the exact next task in PROJECT_STATE.md; do not infer progress from chat history.

Use the existing Site identity and remote. Keep domain, geometry, renderers, persistence, image processing, reconstruction, and collisions separate. Manual measurements always override estimates. Never simulate image analysis or label a primitive as faithful photo reconstruction.

After each significant change, run relevant tests and update PROJECT_STATE.md, ROADMAP.md, and decisions before committing. Leave a precise next action at checkpoints. Do not mark an untested phase DONE. User data and credentials do not belong in Git. Do not add user accounts, catalogs, or automatic layout optimization.

The user has explicitly authorized multiple independent local rooms (F5.3). Preserve existing room data on migration and import.

The user has explicitly authorized the Revit family library (R0–R3). Preserve its V6 bindings/original files and legacy room migrations. Browser RFA imports remain pending until processed by the real Revit addin. Do not claim Windows compilation or live Revit validation from this Linux environment.
