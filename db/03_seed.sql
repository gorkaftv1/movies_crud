-- ===================================
-- MOVIES CRUD - DATOS DE PRUEBA (SEED)
-- Versión Final
-- ===================================
-- NOTA: Reemplaza 'YOUR_USER_ID' con tu ID de usuario real de Supabase
-- ===================================

INSERT INTO public.movies
(
  title,
  year,
  director,
  "cast",
  duration,
  short_desc,
  score,
  genres,
  user_id
)
VALUES

-- =========================
-- PIRATAS DEL CARIBE
-- =========================
(
  'Piratas del Caribe: La maldición de la Perla Negra',
  2003,
  'Gore Verbinski',
  ARRAY['Johnny Depp', 'Orlando Bloom', 'Keira Knightley', 'Geoffrey Rush'],
  143,
  'Un excéntrico pirata se alía con un herrero para rescatar a la hija del gobernador y recuperar su barco maldito.',
  8.1,
  ARRAY['Aventura', 'Fantasía', 'Acción'],
  'YOUR_USER_ID'
),
(
  'Piratas del Caribe: El cofre del hombre muerto',
  2006,
  'Gore Verbinski',
  ARRAY['Johnny Depp', 'Orlando Bloom', 'Keira Knightley', 'Bill Nighy'],
  151,
  'Jack Sparrow debe saldar una deuda de sangre con el temible Davy Jones.',
  7.3,
  ARRAY['Aventura', 'Fantasía', 'Acción'],
  'YOUR_USER_ID'
),
(
  'Piratas del Caribe: En el fin del mundo',
  2007,
  'Gore Verbinski',
  ARRAY['Johnny Depp', 'Orlando Bloom', 'Keira Knightley', 'Geoffrey Rush'],
  169,
  'Los piratas se reúnen para enfrentarse a la Compañía de las Indias Orientales.',
  7.1,
  ARRAY['Aventura', 'Fantasía', 'Acción'],
  'YOUR_USER_ID'
),
(
  'Piratas del Caribe: Navegando aguas misteriosas',
  2011,
  'Rob Marshall',
  ARRAY['Johnny Depp', 'Penélope Cruz', 'Ian McShane'],
  137,
  'Jack Sparrow busca la legendaria Fuente de la Juventud.',
  6.6,
  ARRAY['Aventura', 'Fantasía', 'Acción'],
  'YOUR_USER_ID'
),
(
  'Piratas del Caribe: La venganza de Salazar',
  2017,
  'Joachim Rønning, Espen Sandberg',
  ARRAY['Johnny Depp', 'Javier Bardem', 'Geoffrey Rush'],
  129,
  'Jack Sparrow es perseguido por el fantasma del Capitán Salazar.',
  6.5,
  ARRAY['Aventura', 'Fantasía', 'Acción'],
  'YOUR_USER_ID'
),

-- =========================
-- STAR WARS (SAGA PRINCIPAL)
-- =========================
(
  'Star Wars: Episodio IV - Una nueva esperanza',
  1977,
  'George Lucas',
  ARRAY['Mark Hamill', 'Harrison Ford', 'Carrie Fisher', 'Alec Guinness'],
  121,
  'Un joven granjero se une a la Rebelión para destruir la Estrella de la Muerte.',
  8.6,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio V - El Imperio contraataca',
  1980,
  'Irvin Kershner',
  ARRAY['Mark Hamill', 'Harrison Ford', 'Carrie Fisher', 'James Earl Jones'],
  124,
  'El Imperio persigue a la Rebelión mientras Luke entrena como Jedi.',
  8.7,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio VI - El retorno del Jedi',
  1983,
  'Richard Marquand',
  ARRAY['Mark Hamill', 'Harrison Ford', 'Carrie Fisher'],
  131,
  'La Rebelión lanza su ataque final contra el Imperio.',
  8.3,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio I - La amenaza fantasma',
  1999,
  'George Lucas',
  ARRAY['Liam Neeson', 'Ewan McGregor', 'Natalie Portman'],
  136,
  'El descubrimiento de un joven con un gran poder cambia el destino de la galaxia.',
  6.5,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio II - El ataque de los clones',
  2002,
  'George Lucas',
  ARRAY['Ewan McGregor', 'Natalie Portman', 'Hayden Christensen'],
  142,
  'La República se acerca a una guerra a gran escala.',
  6.6,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio III - La venganza de los Sith',
  2005,
  'George Lucas',
  ARRAY['Ewan McGregor', 'Hayden Christensen', 'Natalie Portman'],
  140,
  'El ascenso de Darth Vader y la caída de la República.',
  7.6,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio VII - El despertar de la Fuerza',
  2015,
  'J.J. Abrams',
  ARRAY['Daisy Ridley', 'John Boyega', 'Adam Driver', 'Harrison Ford'],
  138,
  'Una nueva amenaza surge mientras la Fuerza despierta.',
  7.8,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio VIII - Los últimos Jedi',
  2017,
  'Rian Johnson',
  ARRAY['Daisy Ridley', 'Mark Hamill', 'Adam Driver'],
  152,
  'La Resistencia lucha por sobrevivir frente a la Primera Orden.',
  6.9,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),
(
  'Star Wars: Episodio IX - El ascenso de Skywalker',
  2019,
  'J.J. Abrams',
  ARRAY['Daisy Ridley', 'Adam Driver', 'Oscar Isaac'],
  142,
  'La saga Skywalker llega a su conclusión.',
  6.5,
  ARRAY['Ciencia Ficción', 'Aventura', 'Fantasía'],
  'YOUR_USER_ID'
),

-- =========================
-- DUNE
-- =========================
(
  'Dune',
  2021,
  'Denis Villeneuve',
  ARRAY['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Zendaya'],
  155,
  'Un joven noble debe viajar al planeta más peligroso del universo.',
  8.0,
  ARRAY['Ciencia Ficción', 'Aventura', 'Drama'],
  'YOUR_USER_ID'
),
(
  'Dune: Parte Dos',
  2024,
  'Denis Villeneuve',
  ARRAY['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
  166,
  'Paul Atreides busca venganza mientras abraza su destino.',
  8.6,
  ARRAY['Ciencia Ficción', 'Aventura', 'Drama'],
  'YOUR_USER_ID'
);

-- =========================
-- NOTA IMPORTANTE:
-- Reemplaza 'YOUR_USER_ID' con tu ID de usuario real
-- Para obtenerlo:
-- 1. Regístrate en la aplicación
-- 2. Ve a la tabla auth.users en Supabase
-- 3. Copia tu UUID
-- 4. Ejecuta: UPDATE movies SET user_id = 'TU_UUID_AQUI' WHERE user_id = 'YOUR_USER_ID';
-- =========================
