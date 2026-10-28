# Project Instructions

## Project Structure

- This is a Java real-estate CRM project organized by package directories: `controller`, `model`, `interfaces`, and `exception`.
- Keep each Java type in the directory matching its declared package.
- `model` owns domain types such as `Imovel`, `Casa`, `Apartamento`, `Pessoa`, `Cliente`, and `Corretor`.
- `controller` owns CRM workflows and proposals, including `SistemaCRM` and `Proposta`.
- `interfaces` contains domain contracts, and `exception` contains domain-specific exceptions.

## Coding Conventions

- Preserve the existing package names, public APIs, and Portuguese domain terminology unless a task explicitly calls for a change.
- Use standard Java naming: `UpperCamelCase` for classes/interfaces, `lowerCamelCase` for methods and fields, and `UPPER_SNAKE_CASE` for constants.
- Prefer the existing simple Java style and avoid adding dependencies or architectural layers without a concrete need.
- Implement domain behavior in the class or interface that owns that behavior; keep controllers focused on coordinating CRM operations.
- Keep exception behavior explicit and consistent with the declared checked or unchecked exception type.

## Validation

- No build tool, dependency manifest, or test suite is currently present. Do not assume Maven, Gradle, a Java version, or a test command.
- Before choosing validation commands, check the available JDK and any newly added project build/test configuration.
- For self-contained source changes, compile the package sources with the available JDK when practical; report clearly when compilation or tests cannot be run.
- Add or update focused tests when a test framework is introduced, following its established layout and conventions.