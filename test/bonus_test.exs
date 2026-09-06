defmodule Picape.BonusTest do
  use Picape.DataCase

  alias Picape.Bonus

  # The product ids the offer fixtures cover. Two of them sit behind the same
  # offer, so a match of more than one ingredient is covered too.
  @flour 10_964_101
  @yeast 10_568_334
  @butter 10_567_923
  @bananas 10_691_218

  # "AH Gekoelde deegwaren", the offer whose fixture carries flour and yeast.
  @dough_offer "385466"
  # "AH Nectarines schaal 1 kilo", whose fixture carries bananas.
  @fruit_offer "512005"

  setup do
    insert!(:ingredient, name: "Flour", supermarket_product_id: @flour)
    insert!(:ingredient, name: "Yeast", supermarket_product_id: @yeast)
    insert!(:ingredient, name: "Butter", supermarket_product_id: @butter)
    insert!(:ingredient, name: "Bananas", supermarket_product_id: @bananas)
    :ok
  end

  test "it lists the offers for the period with how many may be activated" do
    bonus = Bonus.offers()

    assert bonus.maximum_activations == 10
    assert bonus.activated_count == 0
    assert length(bonus.offers) == 15

    offer = Enum.find(bonus.offers, &(&1.id == @dough_offer))
    assert offer.title == "AH Gekoelde deegwaren"
    assert offer.discount == "20% korting"
    assert offer.category == "Maaltijden, salades"
    assert offer.product_count == 5
    assert offer.is_activated == false
    assert offer.image_url =~ "200x200"
  end

  test "it names the ingredients an offer covers and lists those offers first" do
    bonus = Bonus.offers()

    offer = Enum.find(bonus.offers, &(&1.id == @dough_offer))
    assert Enum.map(offer.ingredients, & &1.name) == ["Flour", "Yeast"]

    # Three of the fifteen fixtures carry products, and only those three match.
    # Among them the supermarket's own order is kept.
    matched = Enum.take_while(bonus.offers, &(&1.ingredients != []))
    assert Enum.map(matched, & &1.id) == [@dough_offer, @fruit_offer, "385524"]
  end

  test "an offer with no ingredient behind it matches nothing" do
    offer = Enum.find(Bonus.offers().offers, &(&1.id == "566856"))

    assert offer.ingredients == []
  end

  test "activating an offer marks it activated and counts against the maximum" do
    assert {:ok, bonus} = Bonus.activate(@fruit_offer)

    assert bonus.activated_count == 1
    assert Enum.find(bonus.offers, &(&1.id == @fruit_offer)).is_activated
    assert Enum.count(bonus.offers, & &1.is_activated) == 1
  end

  test "an offer that is already activated is not activated twice" do
    assert {:ok, _bonus} = Bonus.activate(@fruit_offer)

    assert {:error, message} = Bonus.activate(@fruit_offer)
    assert message =~ "already activated"
  end

  test "it refuses to activate more offers than the period allows" do
    ids = Bonus.offers().offers |> Enum.take(10) |> Enum.map(& &1.id)
    Enum.each(ids, fn id -> assert {:ok, _bonus} = Bonus.activate(id) end)

    assert Bonus.offers().activated_count == 10

    eleventh = Enum.find(Bonus.offers().offers, &(not &1.is_activated))
    assert {:error, message} = Bonus.activate(eleventh.id)
    assert message =~ "all 10 activations"
  end

  test "an offer the supermarket does not know is not activated" do
    assert {:error, message} = Bonus.activate("no-such-offer")
    assert message =~ "no bonus offer"
  end

  test "an activation the supermarket refuses comes back as its own message" do
    assert {:error, "OFFER_NOT_FOUND"} = Picape.Supermarket.activate_bonus_offer(1, "2026-09-07")
  end
end
