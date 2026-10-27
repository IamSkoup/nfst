# Ресурсы и лицензии

## Игра и собственные ассеты

Код, интерфейс, трассы, процедурное окружение и модель `assets/models/fuli.glb` созданы в этой задаче. Исходный генератор Blender: `tools/models.py`. Непрерывная сетка тела получена объединением анатомических объёмов, voxel-remesh и сглаживанием; окраска записана в атрибуты вершин. GLB содержит скелет, веса, материалы и клипы Idle/Run. Гепарды-соперники используют варианты этой сетки, а не независимые скульптуры. Скутер с условным водителем собирается из объёмной геометрии в `World.scooter()` (`js/world.js`). Его точное соответствие Kugoo Kirin EC-02 не заявляется.

`adrenaline-hiss.ogg` и `adrenaline-release.ogg` — оригинальные подготовленные звуковые сэмплы: фильтрованный широкополосный шум с огибающей. Созданы локально FFmpeg для шипения адреналина; не являются извлечёнными звуками Need for Speed. Генератор воспроизводится командами в `tools/make-hiss.sh`. Во время игры воспроизводятся локальные аудиофайлы, WebAudio-осцилляторы не используются.

Фули, Азад и The Lion Guard — персонажи и название Disney. Need for Speed — референс структуры и настроения, права принадлежат соответствующим владельцам. Авторские права на сторонних персонажей не передаются лицензиями на код/ресурсы. Никаких ассетов Disney/NFS, логотипов EA, голосов актёров, коммерческих песен или частей пользовательских скриншотов в пакет не включено. Перед публичным коммерческим распространением требуется отдельная проверка прав на персонажей и бренды.

## Three.js

- Версия: 0.170.0, источник: https://www.npmjs.com/package/three/v/0.170.0
- Авторы: Three.js authors.
- MIT; полный текст: `assets/THREE-LICENSE.txt`.
- Движок и GLTFLoader включены в локальную сборку.

## Шрифты

- Barlow Condensed: Jeremy Tribby / Barlow Project, SIL Open Font License 1.1. https://github.com/google/fonts/tree/main/ofl/barlowcondensed
- Roboto Condensed: Roboto Project authors, SIL Open Font License 1.1. https://github.com/google/fonts/tree/main/ofl/robotocondensed
- Копии лицензий находятся в `assets/fonts/OFL.txt`, `assets/fonts/ROBOTO-OFL.txt`.

## Звуковые эффекты Kenney

Файлы `break.ogg`, `coin.ogg`, `fall.ogg`, `jump.ogg`, `land.ogg`, `walking.ogg`.

- Автор: Kenney.
- Источник: https://github.com/KenneyNL/Starter-Kit-3D-Platformer/tree/3fa8a04b1c01ab23db43123d4ce814a34c3fc7f0/sounds
- Лицензия звуков: **CC0**, прямо указана в README репозитория; сохранён в `assets/KENNEY-ASSET-LICENSE.md`.
- Код исходного starter kit лицензирован MIT, копия: `assets/KENNEY-LICENSE.txt`. Его код в игру не переносился.
- Файлы эффектов скачаны без изменений. При воспроизведении изменяются громкость и playbackRate.

## Музыка

Все файлы получены из репозитория Godot Engine demo projects, commit `b761b4cd5718a7118f2c95eb55f181d0a5f004f1`.

| Локальный файл | Источник | Авторство и основание использования |
|---|---|---|
| `forest.ogg` | `2d/dodge_the_creeps/art/House In a Forest Loop.ogg` | **HorrorPen, 2012, CC BY 3.0**. Название: House In a Forest Loop. Источник автора: https://opengameart.org/content/loop-house-in-a-forest . Лицензия: https://creativecommons.org/licenses/by/3.0/ . Атрибуция подтверждена README demo, локальная копия `assets/FOREST-ATTRIBUTION.md`. Файл не изменён, переименован. |
| `the-comeback.ogg` | `audio/bpm_sync/the_comeback2.ogg` | Godot demo contributors; MIT репозитория, отдельного уведомления об иной лицензии в каталоге нет. |
| `intro.ogg` | `audio/device_changer/Intro.ogg` | Godot demo contributors; MIT репозитория, отдельного уведомления об иной лицензии в каталоге нет. |
| `maldita.ogg` | `audio/spectrum/maldita.ogg` | Godot demo contributors; MIT репозитория, отдельного уведомления об иной лицензии в каталоге нет. |

Ссылка на зафиксированную версию: https://github.com/godotengine/godot-demo-projects/tree/b761b4cd5718a7118f2c95eb55f181d0a5f004f1 . MIT: Copyright 2014-present Godot Engine contributors; Copyright 2007-2014 Juan Linietsky, Ariel Manzur. Полный текст: `assets/GODOT-LICENSE.md`. Треки не заявляются специально написанным саундтреком, файлы не изменялись кроме локального имени.

Трек Bad Cat из примеров Three.js рассматривался, но **не включён**: не удалось проверить его отдельную лицензию через доступную сеть. Он не используется и не требуется для сборки.
