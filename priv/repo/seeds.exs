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
rice = insert! :essential, name: "Rice", supermarket_product_id: 10583837
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

# Ingredients
shoarma = insert! :ingredient, name: "Shoarma", supermarket_product_id: 10291907
pita = insert! :ingredient, name: "Pita Bread", supermarket_product_id: 10511606
rucola = insert! :ingredient, name: "Rucola", supermarket_product_id: 10075916
graded_old_cheese = insert! :ingredient, name: "Graded Old Cheese", supermarket_product_id: 10760872
graded_young_cheese = insert! :ingredient, name: "Graded Young Cheese", supermarket_product_id: 10583824
graded_mozarella = insert! :ingredient, name: "Graded Mozarella", supermarket_product_id: 10762991

# Recipes
insert! :recipe, title: "Nasi", ingredients: [
  chicken,
  rice,
  chinese_veges,
  nasi_mix,
  ketjap,
  egg,
  oil_cooking,
]
insert! :recipe, title: "Shoarma", ingredients: [
  shoarma,
  pita,
  rucola,
]
insert! :recipe, title: "Pizza", ingredients: [
  flour,
  yeast,
  graded_mozarella,
  tomato_puree,
]
