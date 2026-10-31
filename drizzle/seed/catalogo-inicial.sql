-- =============================================================================
-- Doce Costura — catálogo inicial (pode ser executado mais de uma vez)
-- Rodar DEPOIS de drizzle/0000_inicial.sql.
--
-- Preços, estoque, peso, dimensões, materiais e instruções de lavagem NÃO
-- foram informados: ficam vazios (NULL / 0) até o cadastro pelo painel.
-- Os produtos entram como "coming_soon" (aparecem na loja como "Preço em breve").
-- Os códigos SKU são internos e podem ser alterados no painel.
-- =============================================================================

insert into category (slug, name, short_name, position) values
  ('panos-de-prato-decorados',  'Panos de prato decorados',  'Decorados',          1),
  ('panos-de-prato-com-renda',  'Panos de prato com renda',  'Com renda',          2),
  ('panos-de-prato-com-babado', 'Panos de prato com babado', 'Com babado',         3),
  ('colecao-floral',            'Coleção floral',            'Floral',             4),
  ('colecao-cozinha',           'Coleção cozinha',           'Cozinha',            5),
  ('kits-para-presente',        'Kits para presente',        'Kits para presente', 6),
  ('novidades',                 'Novidades',                 'Novidades',          7),
  ('promocoes',                 'Promoções',                 'Promoções',          8)
on conflict (slug) do nothing;

insert into product (slug, name, summary, status) values
  ('pano-de-prato-cha-azul',           'Pano de Prato Chá Azul',           'Renda branca e babado xadrez azul, com barrado de bules e xícaras.', 'coming_soon'),
  ('pano-de-prato-milho-e-pimentao',   'Pano de Prato Milho e Pimentão',   'Acabamento amarelo.',                                               'coming_soon'),
  ('pano-de-prato-tomates',            'Pano de Prato Tomates',            'Detalhes vermelhos e renda branca, com barrado de tomates.',         'coming_soon'),
  ('pano-de-prato-cenoura-e-abobora',  'Pano de Prato Cenoura e Abóbora',  'Babado e renda, com barrado de cenouras e abóboras.',                'coming_soon'),
  ('pano-de-prato-horta-verde',        'Pano de Prato Horta Verde',        'Babado xadrez verde, com barrado de legumes da horta.',             'coming_soon'),
  ('pano-de-prato-patinhos-e-lavanda', 'Pano de Prato Patinhos e Lavanda', 'Detalhes florais em lilás, com patinhos e ramos de lavanda.',       'coming_soon')
on conflict (slug) do nothing;

insert into product_category (product_id, category_id)
select p.id, c.id
from (values
  ('pano-de-prato-cha-azul', 'panos-de-prato-decorados'),
  ('pano-de-prato-cha-azul', 'panos-de-prato-com-renda'),
  ('pano-de-prato-cha-azul', 'panos-de-prato-com-babado'),
  ('pano-de-prato-cha-azul', 'colecao-floral'),
  ('pano-de-prato-milho-e-pimentao', 'panos-de-prato-decorados'),
  ('pano-de-prato-milho-e-pimentao', 'colecao-cozinha'),
  ('pano-de-prato-tomates', 'panos-de-prato-decorados'),
  ('pano-de-prato-tomates', 'panos-de-prato-com-renda'),
  ('pano-de-prato-tomates', 'colecao-cozinha'),
  ('pano-de-prato-cenoura-e-abobora', 'panos-de-prato-decorados'),
  ('pano-de-prato-cenoura-e-abobora', 'panos-de-prato-com-renda'),
  ('pano-de-prato-cenoura-e-abobora', 'panos-de-prato-com-babado'),
  ('pano-de-prato-cenoura-e-abobora', 'colecao-cozinha'),
  ('pano-de-prato-horta-verde', 'panos-de-prato-decorados'),
  ('pano-de-prato-horta-verde', 'panos-de-prato-com-babado'),
  ('pano-de-prato-horta-verde', 'colecao-cozinha'),
  ('pano-de-prato-patinhos-e-lavanda', 'panos-de-prato-decorados'),
  ('pano-de-prato-patinhos-e-lavanda', 'panos-de-prato-com-renda'),
  ('pano-de-prato-patinhos-e-lavanda', 'panos-de-prato-com-babado'),
  ('pano-de-prato-patinhos-e-lavanda', 'colecao-floral')
) as v(product_slug, category_slug)
join product p on p.slug = v.product_slug
join category c on c.slug = v.category_slug
on conflict do nothing;

insert into product_image (product_id, url, alt, width, height, position)
select p.id, v.url, v.alt, v.width, v.height, 0
from (values
  ('pano-de-prato-cha-azul', '/images/produtos/cha-azul.jpg', 'Pano de prato branco com renda, faixa amarela estampada com bules azuis e babado xadrez azul', 797, 637),
  ('pano-de-prato-tomates', '/images/produtos/tomates.jpg', 'Pano de prato branco com faixas vermelhas, rendas brancas e barrado estampado com tomates', 438, 422),
  ('pano-de-prato-cenoura-e-abobora', '/images/produtos/cenoura-abobora.jpg', 'Pano de prato branco com barrado de cenouras e abóboras, babado de laise branca e xadrez laranja', 388, 373),
  ('pano-de-prato-horta-verde', '/images/produtos/horta-verde.jpg', 'Pano de prato branco com barrado de alfaces, abobrinhas e aspargos e babado xadrez verde', 398, 373),
  ('pano-de-prato-patinhos-e-lavanda', '/images/produtos/patinhos-lavanda.jpg', 'Pano de prato branco com faixa amarela, barrado lilás com patinhos e babado estampado com lavanda', 394, 373)
) as v(product_slug, url, alt, width, height)
join product p on p.slug = v.product_slug
where not exists (select 1 from product_image i where i.product_id = p.id and i.url = v.url);

insert into product_variant (product_id, sku, name, swatch_url, stock, position)
select p.id, v.sku, v.name, v.swatch, 0, 0
from (values
  ('pano-de-prato-cha-azul', 'DC-CHA-AZUL', 'Chá Azul', '/images/estampas/cha-azul.jpg'),
  ('pano-de-prato-milho-e-pimentao', 'DC-MILHO-PIMENTAO', 'Milho e Pimentão', null),
  ('pano-de-prato-tomates', 'DC-TOMATES', 'Tomates', '/images/estampas/tomates.jpg'),
  ('pano-de-prato-cenoura-e-abobora', 'DC-CENOURA-ABOBORA', 'Cenoura e Abóbora', '/images/estampas/cenoura-abobora.jpg'),
  ('pano-de-prato-horta-verde', 'DC-HORTA-VERDE', 'Horta Verde', '/images/estampas/horta-verde.jpg'),
  ('pano-de-prato-patinhos-e-lavanda', 'DC-PATINHOS-LAVANDA', 'Patinhos e Lavanda', '/images/estampas/patinhos-lavanda.jpg')
) as v(product_slug, sku, name, swatch)
join product p on p.slug = v.product_slug
on conflict (sku) do nothing;

insert into store_settings (id) values ('default') on conflict (id) do nothing;
