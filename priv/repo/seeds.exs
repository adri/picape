# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Picape.Factory.insert!(:some_factory)
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
import Picape.Factory, only: [insert!: 2]

# - Nasi (rice, Chinese vegetables, chicken, nasi mix)

# Always:
#  wraps, graded cheese, tomato sauce, soup, bread rolls,
#  nachos, lasagne blades, teriyaki, pesto, butter, milk, yogurt, eggs, spinach, frozen salmon, onion, garlic, muesli, cranberry, bananas, strawberries,     blueberries, grapes, sirup, chilli sauce, ketjap, garlic sauce,
# chocolate, muesli bars, guest cookies, flour, yeast, tomato puree, bladerdeeg, cashew nuts, cacao powder, Italian herbs, salt, pepper, gehakt kruiden, cinnamon, bouillon cube,
# Tissues, toilet paper, honey, strawberry jam, hagelslag, Chinese veggies
# Washing liquid, laundry softener
# Tortellini, gnocci?

# Essentials
butter = insert! :essential, name: "Butter",  supermarket_product_id: 10567923
chicken = insert! :essential, name: "Chicken", supermarket_product_id: 10291994
creme_fraice = insert! :essential, name: "Crème Fraîche", supermarket_product_id: 10564710
pasta = insert! :essential, name: "Rigate Pasta", supermarket_product_id: 10580207
rice = insert! :essential, name: "Rijst", supermarket_product_id: 10583837
mince = insert! :essential, name: "Mince", supermarket_product_id: 10281999
wraps = insert! :essential, name: "Wraps", supermarket_product_id: 10567189
appelsap = insert! :essential, name: "Appel Pear Juice", supermarket_product_id: 90001401
corn = insert! :essential, name: "Corn", supermarket_product_id: 10562412
kidney_beans = insert! :essential, name: "Kidney beans", supermarket_product_id: 10525111
mixed_veges_frozen = insert! :essential, name: "Frozen Mixed Veges", supermarket_product_id: 10075909
chinese_veges = insert! :essential, name: "Chinese Wokmix", supermarket_product_id: 10074856
nasi_mix = insert! :essential, name: "Nasi Mix", supermarket_product_id: 10578447
ketjap = insert! :essential, name: "Ketjap", supermarket_product_id: 10580704
egg = insert! :essential, name: "Egg", supermarket_product_id: 10761800
oil_cooking = insert! :essential, name: "Cooking Oil", supermarket_product_id: 10568932
tomato_sauce = insert! :essential, name: "Tomatosauce", supermarket_product_id: 10583893
tomato_puree = insert! :essential, name: "Tomatopuree", supermarket_product_id: 10580454
flour = insert! :essential, name: "Flour", supermarket_product_id: 10964101
yeast = insert! :essential, name: "Yeast", supermarket_product_id: 10568334
bananas = insert! :essential, name: "Bananas", supermarket_product_id: 10691218
# The supermarket grades most of what it sells and answers "N/A" for the rest,
# so the seeded cart needs one of each. Without a product the supermarket does
# not grade, no screen ever renders a row without a Nutri-Score.
insert! :essential, name: "Parmezaanse kaas", supermarket_product_id: 238913
# A tenth of the ingredients in the production database point at a product the
# supermarket has stopped selling, and five of those are essentials it reorders
# every week. Without one here, nothing renders the warning that says so.
insert! :essential, name: "Sinaasappel", supermarket_product_id: 519017

# Ingredients
shoarma = insert! :ingredient, name: "Shoarma", supermarket_product_id: 10291907
pita = insert! :ingredient, name: "Pita Bread", supermarket_product_id: 10511606
rucola = insert! :ingredient, name: "Rucola", supermarket_product_id: 10075916
graded_old_cheese = insert! :ingredient, name: "Graded Old Cheese", supermarket_product_id: 10760872
graded_young_cheese = insert! :ingredient, name: "Graded Young Cheese", supermarket_product_id: 10583824
graded_mozarella = insert! :ingredient, name: "Graded Mozarella", supermarket_product_id: 10762991

# Recipes
#
# One recipe carries a description. The detail screen splits it on the blank
# line into the steps you tick off, and without one every seeded recipe rendered
# a single empty card, so no screenshot ever covered a step. One step names a
# duration, which is what the screen turns into a timer link.
#
# It ends with a YouTube link, the way five of the production recipes do. The
# screen lifts that link out of the steps and gives it a player of its own. The
# `m.` host is deliberate: one of those five was written on a phone, so the
# host is not always `www.`
nasi_steps = String.trim("""
Kook de rijst volgens de aanwijzing op de verpakking en laat hem afkoelen.

Bak de kip in de olie tot hij gaar is, en schep de wokgroenten erdoor.

Roer de nasimix en de ketjap erdoor en bak alles nog 5 minuten door.

https://m.youtube.com/watch?v=CgpbnBlN_ZU
""")
nasi = insert! :recipe, title: "Nasi", description: nasi_steps, image_url: "https://user-images.githubusercontent.com/133832/28996360-3152b366-79ff-11e7-9d0e-01ffb907e32c.jpg", ingredients: [
  chicken,
  rice,
  chinese_veges,
  nasi_mix,
  ketjap,
  egg,
  oil_cooking,
]
shoarma = insert! :recipe, title: "Shoarma", image_url: "https://user-images.githubusercontent.com/133832/28996359-31513040-79ff-11e7-9dd1-59917a2247e5.jpg", ingredients: [
  shoarma,
  pita,
  rucola,
]
insert! :recipe, title: "Pizza", image_url: "https://user-images.githubusercontent.com/133832/28996361-317307d8-79ff-11e7-9eea-f1dcafda8bfa.jpg", ingredients: [
  flour,
  yeast,
  graded_mozarella,
  tomato_puree,
]


# A finished order. Without one `lastOrderedRecipes` is empty, so the plan
# screen's "Dit heb je in huis" shelf never rendered and no screenshot ever
# covered it, nor a card's cooked state.
#
# `start_shopping` moves the current order's contents to a line id of the
# microsecond clock and leaves "1" free for the next one, so a finished order
# has a large id and the current one does not. Seeding it that way keeps this
# out of the current order, which is what the cart and the basics tab read.
finished_order = "1700000000000000"
insert! :planned_recipe, line_id: finished_order, recipe_id: nasi.id
insert! :planned_recipe, line_id: finished_order, recipe_id: shoarma.id, cooked: true

# What was put on those orders by hand, which is what "Eerder gekocht" reads
# back. Two orders rather than one, and every row with its own timestamp, so
# the screen has an order it can get wrong: most recently bought on top.
older_order = "1600000000000000"

[
  {creme_fraice, older_order, ~N[2026-07-04 17:10:00]},
  {corn, older_order, ~N[2026-07-04 17:11:00]},
  {kidney_beans, older_order, ~N[2026-07-04 17:12:00]},
  {bananas, finished_order, ~N[2026-08-15 18:20:00]},
  {appelsap, finished_order, ~N[2026-08-15 18:21:00]},
  {graded_old_cheese, finished_order, ~N[2026-08-15 18:22:00]}
]
|> Enum.each(fn {ingredient, line_id, bought_at} ->
  insert! :manual_ingredient,
    line_id: line_id,
    ingredient_id: ingredient.id,
    inserted_at: bought_at
end)

# supermarket_product_raw is what carries an ingredient's picture, its price,
# its nutriscore and the supermarket's description of it, and only the nightly
# job fills it. Until it runs, a seeded database has none of that and every
# screen built on it looks broken. This is that job, run once, against whatever
# supermarket the seed run points at: the fake for `bin/phx --fake`. It rescues
# its own failures, so a run without a supermarket still finishes.
Picape.Ingredients.match_supermarket_products()
