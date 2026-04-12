import type { SupportedLanguage } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

// ── Shared email layout ──

const PLATFORM_NAME = 'findyour.club'
const PLATFORM_URL = 'https://findyour.club'
const CONTACT_EMAIL = 'contact@findyour.club'

// Background SVG pattern (clubs/activities icons at 0.07 opacity)
const BG_SVG = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMzYiIGhlaWdodD0iMjI0IiB2aWV3Qm94PSIwIDAgMzM2IDIyNCIgb3BhY2l0eT0iMC4wNyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTYsMTYpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xMS4xIDcuMWExNi41NSAxNi41NSAwIDAgMSAxMC45IDQiLz48cGF0aCBkPSJNMTIgMTJhMTIuNiAxMi42IDAgMCAxLTguNyA1Ii8+PHBhdGggZD0iTTE2LjggMTMuNmExNi41NSAxNi41NSAwIDAgMS05IDcuNSIvPjxwYXRoIGQ9Ik0yMC43IDE3YTEyLjggMTIuOCAwIDAgMC04LjctNSAxMy4zIDEzLjMgMCAwIDEgMC0xMCIvPjxwYXRoIGQ9Ik02LjMgMy44YTE2LjU1IDE2LjU1IDAgMCAwIDEuOSAxMS41Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTYsNzIpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xMiAxOHY0Ii8+PHBhdGggZD0iTTIgMTQuNDk5YTUuNSA1LjUgMCAwIDAgOS41OTEgMy42NzUuNi42IDAgMCAxIC44MTguMDAxQTUuNSA1LjUgMCAwIDAgMjIgMTQuNWMwLTIuMjktMS41LTQtMy01LjVsLTUuNDkyLTUuMzEyYTIgMiAwIDAgMC0zLS4wMkw1IDguOTk5Yy0xLjUgMS41LTMgMy4yLTMgNS41Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2LDEyOCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSI1IiByPSIxIi8+PHBhdGggZD0ibTkgMjAgMy02IDMgNiIvPjxwYXRoIGQ9Im02IDggNiAyIDYtMiIvPjxwYXRoIGQ9Ik0xMiAxMHY0Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2LDE4NCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJtMTYuMjQgNy43Ni0xLjgwNCA1LjQxMWEyIDIgMCAwIDEtMS4yNjUgMS4yNjVMNy43NiAxNi4yNGwxLjgwNC01LjQxMWEyIDIgMCAwIDEgMS4yNjUtMS4yNjV6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcyLDQ0KSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cGF0aCBkPSJNOSAxOFY1bDEyLTJ2MTMiLz48Y2lyY2xlIGN4PSI2IiBjeT0iMTgiIHI9IjMiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjE2IiByPSIzIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcyLDEwMCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEzLjk5NyA0YTIgMiAwIDAgMSAxLjc2IDEuMDVsLjQ4Ni45QTIgMiAwIDAgMCAxOC4wMDMgN0gyMGEyIDIgMCAwIDEgMiAydjlhMiAyIDAgMCAxLTIgMkg0YTIgMiAwIDAgMS0yLTJWOWEyIDIgMCAwIDEgMi0yaDEuOTk3YTIgMiAwIDAgMCAxLjc1OS0xLjA0OGwuNDg5LS45MDRBMiAyIDAgMCAxIDEwLjAwNCA0eiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjMiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzIsMTU2KSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHg9IjIiIHk9IjEwIiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJtMTcuOTIgMTQgMy41LTMuNWEyLjI0IDIuMjQgMCAwIDAgMC0zbC01LTQuOTJhMi4yNCAyLjI0IDAgMCAwLTMgMEwxMCA2Ii8+PHBhdGggZD0iTTYgMThoLjAxIi8+PHBhdGggZD0iTTEwIDE0aC4wMSIvPjxwYXRoIGQ9Ik0xNSA2aC4wMSIvPjxwYXRoIGQ9Ik0xOCA5aC4wMSIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3MiwyMTIpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Im0xMC4wNjUgMTIuNDkzLTYuMTggMS4zMThhLjkzNC45MzQgMCAwIDEtMS4xMDgtLjcwMmwtLjUzNy0yLjE1YTEuMDcgMS4wNyAwIDAgMSAuNjkxLTEuMjY1bDEzLjUwNC00LjQ0Ii8+PHBhdGggZD0ibTEzLjU2IDExLjc0NyA0LjMzMi0uOTI0Ii8+PHBhdGggZD0ibTE2IDIxLTMuMTA1LTYuMjEiLz48cGF0aCBkPSJNMTYuNDg1IDUuOTRhMiAyIDAgMCAxIDEuNDU1LTIuNDI1bDEuMDktLjI3MmExIDEgMCAwIDEgMS4yMTIuNzI3bDEuNTE1IDYuMDZhMSAxIDAgMCAxLS43MjcgMS4yMTNsLTEuMDkuMjcyYTIgMiAwIDAgMS0yLjQyNS0xLjQ1NXoiLz48cGF0aCBkPSJtNi4xNTggOC42MzMgMS4xMTQgNC40NTYiLz48cGF0aCBkPSJtOCAyMSAzLjEwNS02LjIxIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMyIgcj0iMiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3MiwtMTIpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Im0xMC4wNjUgMTIuNDkzLTYuMTggMS4zMThhLjkzNC45MzQgMCAwIDEtMS4xMDgtLjcwMmwtLjUzNy0yLjE1YTEuMDcgMS4wNyAwIDAgMSAuNjkxLTEuMjY1bDEzLjUwNC00LjQ0Ii8+PHBhdGggZD0ibTEzLjU2IDExLjc0NyA0LjMzMi0uOTI0Ii8+PHBhdGggZD0ibTE2IDIxLTMuMTA1LTYuMjEiLz48cGF0aCBkPSJNMTYuNDg1IDUuOTRhMiAyIDAgMCAxIDEuNDU1LTIuNDI1bDEuMDktLjI3MmExIDEgMCAwIDEgMS4yMTIuNzI3bDEuNTE1IDYuMDZhMSAxIDAgMCAxLS43MjcgMS4yMTNsLTEuMDkuMjcyYTIgMiAwIDAgMS0yLjQyNS0xLjQ1NXoiLz48cGF0aCBkPSJtNi4xNTggOC42MzMgMS4xMTQgNC40NTYiLz48cGF0aCBkPSJtOCAyMSAzLjEwNS02LjIxIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMyIgcj0iMiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjgsMTYpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xMS41NjIgMy4yNjZhLjUuNSAwIDAgMSAuODc2IDBMMTUuMzkgOC44N2ExIDEgMCAwIDAgMS41MTYuMjk0TDIxLjE4MyA1LjVhLjUuNSAwIDAgMSAuNzk4LjUxOWwtMi44MzQgMTAuMjQ2YTEgMSAwIDAgMS0uOTU2LjczNEg1LjgxYTEgMSAwIDAgMS0uOTU3LS43MzRMMi4wMiA2LjAyYS41LjUgMCAwIDEgLjc5OC0uNTE5bDQuMjc2IDMuNjY0YTEgMSAwIDAgMCAxLjUxNi0uMjk0eiIvPjxwYXRoIGQ9Ik01IDIxaDE0Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyOCw3MikiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEwIDE0LjY2djEuNjI2YTIgMiAwIDAgMS0uOTc2IDEuNjk2QTUgNSAwIDAgMCA3IDIxLjk3OCIvPjxwYXRoIGQ9Ik0xNCAxNC42NnYxLjYyNmEyIDIgMCAwIDAgLjk3NiAxLjY5NkE1IDUgMCAwIDEgMTcgMjEuOTc4Ii8+PHBhdGggZD0iTTE4IDloMS41YTEgMSAwIDAgMCAwLTVIMTgiLz48cGF0aCBkPSJNNCAyMmgxNiIvPjxwYXRoIGQ9Ik02IDlhNiA2IDAgMCAwIDEyIDBWM2ExIDEgMCAwIDAtMS0xSDdhMSAxIDAgMCAwLTEgMXoiLz48cGF0aCBkPSJNNiA5SDQuNWExIDEgMCAwIDEgMC01SDYiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI4LDEyOCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0ibTExLjkgMTIuMSA0LjUxNC00LjUxNCIvPjxwYXRoIGQ9Ik0yMC4xIDIuM2ExIDEgMCAwIDAtMS40IDBsLTEuMTE0IDEuMTE0QTIgMiAwIDAgMCAxNyA0LjgyOHYxLjM0NGEyIDIgMCAwIDEtLjU4NiAxLjQxNEEyIDIgMCAwIDEgMTcuODI4IDdoMS4zNDRhMiAyIDAgMCAwIDEuNDE0LS41ODZMMjEuNyA1LjNhMSAxIDAgMCAwIDAtMS40eiIvPjxwYXRoIGQ9Im02IDE2IDIgMiIvPjxwYXRoIGQ9Ik04LjIzIDkuODVBMyAzIDAgMCAxIDExIDhhNSA1IDAgMCAxIDUgNSAzIDMgMCAwIDEtMS44NSAyLjc3bC0uOTIuMzhBMiAyIDAgMCAwIDEyIDE4YTQgNCAwIDAgMS00IDQgNiA2IDAgMCAxLTYtNiA0IDQgMCAwIDEgNC00IDIgMiAwIDAgMCAxLjg1LTEuMjN6Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyOCwxODQpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Im0xNiAyLTIuMyAyLjNhMyAzIDAgMCAwIDAgNC4ybDEuOCAxLjhhMyAzIDAgMCAwIDQuMiAwTDIyIDgiLz48cGF0aCBkPSJNMTUgMTUgMy4zIDMuM2E0LjIgNC4yIDAgMCAwIDAgNmw3LjMgNy4zYy43LjcgMiAuNyAyLjggMEwxNSAxNVptMCAwIDcgNyIvPjxwYXRoIGQ9Im0yLjEgMjEuOCA2LjQtNi4zIi8+PHBhdGggZD0ibTE5IDUtNyA3Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4NCw0NCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTggMjJoOCIvPjxwYXRoIGQ9Ik03IDEwaDEwIi8+PHBhdGggZD0iTTEyIDE1djciLz48cGF0aCBkPSJNMTIgMTVhNSA1IDAgMCAwIDUtNWMwLTItLjUtNC0yLThIOWMtMS41IDQtMiA2LTIgOGE1IDUgMCAwIDAgNSA1WiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODQsMTAwKSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMTIgN3YxNCIvPjxwYXRoIGQ9Ik0zIDE4YTEgMSAwIDAgMS0xLTFWNGExIDEgMCAwIDEgMS0xaDVhNCA0IDAgMCAxIDQgNCA0IDQgMCAwIDEgNC00aDVhMSAxIDAgMCAxIDEgMXYxM2ExIDEgMCAwIDEtMSAxaC02YTMgMyAwIDAgMC0zIDMgMyAzIDAgMCAwLTMtM3oiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTg0LDE1NikiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEwIDJ2MiIvPjxwYXRoIGQ9Ik0xNCAydjIiLz48cGF0aCBkPSJNMTYgOGExIDEgMCAwIDEgMSAxdjhhNCA0IDAgMCAxLTQgNEg3YTQgNCAwIDAgMS00LTRWOWExIDEgMCAwIDEgMS0xaDE0YTQgNCAwIDEgMSAwIDhoLTEiLz48cGF0aCBkPSJNNiAydjIiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTg0LDIxMikiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEwIDExaC4wMSIvPjxwYXRoIGQ9Ik0xNCA2aC4wMSIvPjxwYXRoIGQ9Ik0xOCA2aC4wMSIvPjxwYXRoIGQ9Ik02LjUgMTMuMWguMDEiLz48cGF0aCBkPSJNMjIgNWMwIDktNCAxMi02IDEycy02LTMtNi0xMmMwLTIgMi0zIDYtM3M2IDEgNiAzIi8+PHBhdGggZD0iTTE3LjQgOS45Yy0uOC44LTIgLjgtMi44IDAiLz48cGF0aCBkPSJNMTAuMSA3LjFDOSA3LjIgNy43IDcuNyA2IDguNmMtMy41IDItNC43IDMuOS0zLjcgNS42IDQuNSA3LjggOS41IDguNCAxMS4yIDcuNC45LS41IDEuOS0yLjEgMS45LTQuNyIvPjxwYXRoIGQ9Ik05LjEgMTYuNWMuMy0xLjEgMS40LTEuNyAyLjQtMS40Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4NCwtMTIpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xMCAxMWguMDEiLz48cGF0aCBkPSJNMTQgNmguMDEiLz48cGF0aCBkPSJNMTggNmguMDEiLz48cGF0aCBkPSJNNi41IDEzLjFoLjAxIi8+PHBhdGggZD0iTTIyIDVjMCA5LTQgMTItNiAxMnMtNi0zLTYtMTJjMC0yIDItMyA2LTNzNiAxIDYgMyIvPjxwYXRoIGQ9Ik0xNy40IDkuOWMtLjguOC0yIC44LTIuOCAwIi8+PHBhdGggZD0iTTEwLjEgNy4xQzkgNy4yIDcuNyA3LjcgNiA4LjZjLTMuNSAyLTQuNyAzLjktMy43IDUuNiA0LjUgNy44IDkuNSA4LjQgMTEuMiA3LjQuOS0uNSAxLjktMi4xIDEuOS00LjciLz48cGF0aCBkPSJNOS4xIDE2LjVjLjMtMS4xIDEuNC0xLjcgMi40LTEuNCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDAsMTYpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xMiAyMmExIDEgMCAwIDEgMC0yMCAxMCA5IDAgMCAxIDEwIDkgNSA1IDAgMCAxLTUgNWgtMi4yNWExLjc1IDEuNzUgMCAwIDAtMS40IDIuOGwuMy40YTEuNzUgMS43NSAwIDAgMS0xLjQgMi44eiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSI2LjUiIHI9Ii41IiBmaWxsPSJjdXJyZW50Q29sb3IiLz48Y2lyY2xlIGN4PSIxNy41IiBjeT0iMTAuNSIgcj0iLjUiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxjaXJjbGUgY3g9IjYuNSIgY3k9IjEyLjUiIHI9Ii41IiBmaWxsPSJjdXJyZW50Q29sb3IiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI3LjUiIHI9Ii41IiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQwLDcyKSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMiA2Yy42LjUgMS4yIDEgMi41IDFDNyA3IDcgNSA5LjUgNWMyLjYgMCAyLjQgMiA1IDIgMi41IDAgMi41LTIgNS0yIDEuMyAwIDEuOS41IDIuNSAxIi8+PHBhdGggZD0iTTIgMTJjLjYuNSAxLjIgMSAyLjUgMSAyLjUgMCAyLjUtMiA1LTIgMi42IDAgMi40IDIgNSAyIDIuNSAwIDIuNS0yIDUtMiAxLjMgMCAxLjkuNSAyLjUgMSIvPjxwYXRoIGQ9Ik0yIDE4Yy42LjUgMS4yIDEgMi41IDEgMi41IDAgMi41LTIgNS0yIDIuNiAwIDIuNCAyIDUgMiAyLjUgMCAyLjUtMiA1LTIgMS4zIDAgMS45LjUgMi41IDEiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQwLDEyOCkiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTExLjUyNSAyLjI5NWEuNTMuNTMgMCAwIDEgLjk1IDBsMi4zMSA0LjY3OWEyLjEyMyAyLjEyMyAwIDAgMCAxLjU5NSAxLjE2bDUuMTY2Ljc1NmEuNTMuNTMgMCAwIDEgLjI5NC45MDRsLTMuNzM2IDMuNjM4YTIuMTIzIDIuMTIzIDAgMCAwLS42MTEgMS44NzhsLjg4MiA1LjE0YS41My41MyAwIDAgMS0uNzcxLjU2bC00LjYxOC0yLjQyOGEyLjEyMiAyLjEyMiAwIDAgMC0xLjk3MyAwTDYuMzk2IDIxLjAxYS41My41MyAwIDAgMS0uNzctLjU2bC44ODEtNS4xMzlhMi4xMjIgMi4xMjIgMCAwIDAtLjYxMS0xLjg3OUwyLjE2IDkuNzk1YS41My41MyAwIDAgMSAuMjk0LS45MDZsNS4xNjUtLjc1NWEyLjEyMiAyLjEyMiAwIDAgMCAxLjU5Ny0xLjE2eiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDAsMTg0KSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMTEgMjBBNyA3IDAgMCAxIDkuOCA2LjFDMTUuNSA1IDE3IDQuNDggMTkgMmMxIDIgMiA0LjE4IDIgOCAwIDUuNS00Ljc4IDEwLTEwIDEwWiIvPjxwYXRoIGQ9Ik0yIDIxYzAtMyAxLjg1LTUuMzYgNS4wOC02QzkuNSAxNC41MiAxMiAxMyAxMyAxMiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTYsNDQpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxjaXJjbGUgY3g9IjE4LjUiIGN5PSIxNy41IiByPSIzLjUiLz48Y2lyY2xlIGN4PSI1LjUiIGN5PSIxNy41IiByPSIzLjUiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjUiIHI9IjEiLz48cGF0aCBkPSJNMTIgMTcuNVYxNGwtMy0zIDQtMyAyIDNoMiIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTYsMTAwKSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIj48cGF0aCBkPSJtOCAzIDQgOCA1LTUgNSAxNUgyTDggM3oiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjk2LDE1NikiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQgMTZ2LTIuMzhDNCAxMS41IDIuOTcgMTAuNSAzIDhjLjAzLTIuNzIgMS40OS02IDQuNS02QzkuMzcgMiAxMCAzLjggMTAgNS41YzAgMy4xMS0yIDUuNjYtMiA4LjY4VjE2YTIgMiAwIDEgMS00IDBaIi8+PHBhdGggZD0iTTIwIDIwdi0yLjM4YzAtMi4xMiAxLjAzLTMuMTIgMS01LjYyLS4wMy0yLjcyLTEuNDktNi00LjUtNkMxNC42MyA2IDE0IDcuOCAxNCA5LjVjMCAzLjExIDIgNS42NiAyIDguNjhWMjBhMiAyIDAgMSAwIDQgMFoiLz48cGF0aCBkPSJNMTYgMTdoNCIvPjxwYXRoIGQ9Ik00IDEzaDQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjk2LDIxMikiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINmE0IDQgMCAwIDAtNCA0djIiLz48cGF0aCBkPSJNMTYgMy4xMjhhNCA0IDAgMCAxIDAgNy43NDQiLz48cGF0aCBkPSJNMjIgMjF2LTJhNCA0IDAgMCAwLTMtMy44NyIvPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSI0Ii8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI5NiwtMTIpIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDZhNCA0IDAgMCAwLTQgNHYyIi8+PHBhdGggZD0iTTE2IDMuMTI4YTQgNCAwIDAgMSAwIDcuNzQ0Ii8+PHBhdGggZD0iTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODciLz48Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCIvPjwvZz48L3N2Zz4=')"

function emailLayout(content: string, lang: SupportedLanguage): string {
  const t = getTranslations(lang).emails.footer
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PLATFORM_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f4f4f5;background-image:${BG_SVG};background-repeat:repeat;background-size:336px 224px;color:#18181b;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
    <tr><td align="center">

      <!-- Header card -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;margin-bottom:8px;">
        <tr><td align="center" style="padding:20px 36px;">
          <a href="${PLATFORM_URL}" style="text-decoration:none;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">${PLATFORM_NAME}</a>
        </td></tr>
      </table>

      <!-- Body card -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;">
        <tr><td style="padding:40px 36px;">
          ${content}
        </td></tr>
      </table>

      <!-- Footer card -->
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;margin-top:8px;">
        <tr><td align="center" style="padding:20px 36px;">
          <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;line-height:1.5;">
            ${t.contact.replace('{email}', `<a href="mailto:${CONTACT_EMAIL}" style="color:#71717a;text-decoration:underline;">${CONTACT_EMAIL}</a>`)}
          </p>
          <p style="margin:0;font-size:11px;color:#d4d4d8;line-height:1.5;">
            ${t.copyright.replace('{year}', String(new Date().getFullYear()))}
          </p>
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:22px;font-weight:700;letter-spacing:-0.01em;color:#18181b;line-height:1.3;">${text}</h1>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46;">${text}</p>`
}

function calloutBox(content: string): string {
  return `<div style="background:#fafafa;border-left:3px solid #18181b;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
    <p style="margin:0;font-size:15px;line-height:1.7;color:#3f3f46;">${content}</p>
  </div>`
}

function primaryButton(text: string, href: string): string {
  return `<table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto;">
    <tr><td style="background:#18181b;border-radius:8px;padding:13px 28px;">
      <a href="${escapeHtml(href)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">${text}</a>
    </td></tr>
  </table>`
}

function smallText(text: string): string {
  return `<p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f4f4f5;margin:24px 0;">`
}

// ── Email templates ──

interface AcceptanceEmailParams {
  clubName: string
  clubUrl: string
  magicLinkUrl: string
  operatorMessage?: string
  lang: SupportedLanguage
}

export function buildAcceptanceEmailHtml({ clubName, clubUrl, magicLinkUrl, operatorMessage, lang }: AcceptanceEmailParams): string {
  const t = getTranslations(lang).emails.acceptance

  const operatorBlock = operatorMessage
    ? calloutBox(`<strong style="color:#18181b;">${t.platformMessage}</strong><br>${escapeHtml(operatorMessage)}`)
    : ''

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.congratulations.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${operatorBlock}
    ${paragraph(t.liveLine)}
    <p style="margin:0 0 20px;">
      <a href="${escapeHtml(clubUrl)}" style="color:#18181b;text-decoration:underline;font-size:15px;font-weight:500;">${escapeHtml(clubUrl)}</a>
    </p>
    ${paragraph(t.setupLine)}
    ${primaryButton(t.setupButton, magicLinkUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface RejectionEmailParams {
  clubName: string
  rejectionReason?: string
  lang: SupportedLanguage
}

export function buildRejectionEmailHtml({ clubName, rejectionReason, lang }: RejectionEmailParams): string {
  const t = getTranslations(lang).emails.rejection

  const explanation = rejectionReason
    ? escapeHtml(rejectionReason)
    : t.defaultReason

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.thankYou.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(explanation)}
    ${paragraph(t.reapply)}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface ApplicationSubmittedEmailParams {
  applicantName: string
  clubName: string
  reviewUrl: string
  lang: SupportedLanguage
}

export function buildApplicationSubmittedEmailHtml({ applicantName, clubName, reviewUrl, lang }: ApplicationSubmittedEmailParams): string {
  const t = getTranslations(lang).emails.applicationSubmitted

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{applicantName}', `<strong>${escapeHtml(applicantName)}</strong>`).replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${primaryButton(t.reviewButton, reviewUrl)}
  `, lang)
}

interface OperatorMessageEmailParams {
  clubName: string
  message: string
  lang: SupportedLanguage
}

export function buildOperatorMessageEmailHtml({ clubName, message, lang }: OperatorMessageEmailParams): string {
  const t = getTranslations(lang).emails.operatorMessage

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(escapeHtml(message))}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface ForceOfflineEmailParams {
  clubName: string
  reason: string
  lang: SupportedLanguage
}

export function buildForceOfflineEmailHtml({ clubName, reason, lang }: ForceOfflineEmailParams): string {
  const t = getTranslations(lang).emails.forceOffline

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${calloutBox(escapeHtml(reason))}
    ${paragraph(t.resolution)}
    ${divider()}
    ${smallText(t.regards)}
  `, lang)
}

interface InvitationEmailParams {
  clubName: string
  acceptUrl: string
  lang: SupportedLanguage
}

export function buildInvitationEmailHtml({ clubName, acceptUrl, lang }: InvitationEmailParams): string {
  const t = getTranslations(lang).emails.invitation

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.acceptButton, acceptUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface PasswordResetEmailParams {
  resetUrl: string
  lang: SupportedLanguage
}

export function buildPasswordResetEmailHtml({ resetUrl, lang }: PasswordResetEmailParams): string {
  const t = getTranslations(lang).emails.passwordReset

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro)}
    ${primaryButton(t.resetButton, resetUrl)}
    ${divider()}
    ${smallText(t.expiry)}
  `, lang)
}

interface VerificationReminderEmailParams {
  clubName: string
  settingsUrl: string
  lang: SupportedLanguage
}

export function buildVerificationReminderEmailHtml({ clubName, settingsUrl, lang }: VerificationReminderEmailParams): string {
  const t = getTranslations(lang).emails.verificationReminder

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.verifyButton, settingsUrl)}
  `, lang)
}

interface VerificationExpiredEmailParams {
  clubName: string
  settingsUrl: string
  lang: SupportedLanguage
}

export function buildVerificationExpiredEmailHtml({ clubName, settingsUrl, lang }: VerificationExpiredEmailParams): string {
  const t = getTranslations(lang).emails.verificationExpired

  return emailLayout(`
    ${heading(t.heading)}
    ${paragraph(t.intro.replace('{clubName}', `<strong>${escapeHtml(clubName)}</strong>`))}
    ${paragraph(t.cta)}
    ${primaryButton(t.verifyButton, settingsUrl)}
  `, lang)
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
