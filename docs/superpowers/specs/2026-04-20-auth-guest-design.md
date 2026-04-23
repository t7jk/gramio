# EngLearn: gość, rejestracja, logowanie PIN — specyfikacja

**Data:** 2026-04-20  
**Status:** zaakceptowana przez użytkownika

## Cel

- Gość widzi **Register** i **Login**; może ćwiczyć bez konta — postęp i statystyki wyłącznie w przeglądarce (`localStorage`; pełny profil może przekraczać limit cookie).
- Po **Register** (nazwa + PIN 4 cyfry) profil na serwerze w `profiles/*.json` (PIN jako hash), sesja PHP; dane dostępne z innego urządzenia po zalogowaniu.
- **Login:** krok 1 — nazwa użytkownika; krok 2 — siatka 4×10 (cyfry 1–9, 0), jedna cyfra z każdej kolumny.
- Po zalogowaniu: **Profile** i **Logout**; bez **Register**/**Login**.
- Usunięcie ekranu **Users** i publicznego tworzenia/kasowania listy użytkowników.
- Zapis na serwerze tylko dla zalogowanego użytkownika; identyfikacja przez sesję (nie ufać polu `user` z klienta).

## Nie w zakresie

- Migracja starych profili bez `pin_hash` (nie zalogują się nowym flow; można utworzyć konto od nowa).
- Scalanie postępu gościa z kontem po zalogowaniu.

## Bezpieczeństwo

- `password_hash` / `password_verify` dla PIN.
- Odpowiedź na zły login: jeden komunikat (np. „Nieprawidłowa nazwa lub PIN”).
- Endpointy modyfikujące profil wymagają aktywnej sesji; nazwa użytkownika z sesji, nie z body.
