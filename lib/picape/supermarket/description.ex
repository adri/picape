defmodule Picape.Supermarket.Description do
  @moduledoc """
  Reads the HTML a product card carries in `descriptionHighlights`.

  React Native cannot render markup, so the description has to reach the client
  as text. Across the 276 recorded product cards the field is only ever
  paragraphs with one bullet list among them, and `<strong>` inside an item, so
  this splits on those two tags and drops the rest rather than parsing HTML.
  """

  @list ~r{<ul.*?</ul>}s
  @list_item ~r{<li[^>]*>(.*?)</li>}s
  @paragraph_end ~r{</p>}i
  @tag ~r{<[^>]*>}
  @whitespace ~r{\s+}
  @entity ~r{&(\#[xX][0-9a-fA-F]+|\#\d+|[a-zA-Z]+);}
  @named_entities %{"amp" => "&", "lt" => "<", "gt" => ">", "quot" => "\"", "nbsp" => " "}

  @doc "The prose around the bullet list, paragraphs separated by a blank line."
  def paragraphs(html) when is_binary(html) do
    @list
    |> Regex.replace(html, "")
    |> String.split(@paragraph_end)
    |> Enum.map(&text/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.join("\n\n")
  end

  def paragraphs(_), do: ""

  @doc "The bullet list, one string per item."
  def highlights(html) when is_binary(html) do
    @list_item
    |> Regex.scan(html)
    |> Enum.map(fn [_, item] -> text(item) end)
    |> Enum.reject(&(&1 == ""))
  end

  def highlights(_), do: []

  defp text(html) do
    @tag
    |> Regex.replace(html, " ")
    |> unescape()
    |> collapse_whitespace()
  end

  defp unescape(text) do
    Regex.replace(@entity, text, fn match, entity ->
      case entity do
        "#x" <> digits -> codepoint(digits, 16)
        "#X" <> digits -> codepoint(digits, 16)
        "#" <> digits -> codepoint(digits, 10)
        name -> Map.get(@named_entities, name, match)
      end
    end)
  end

  defp codepoint(digits, base) do
    case Integer.parse(digits, base) do
      {code, ""} -> <<code::utf8>>
      _ -> ""
    end
  end

  defp collapse_whitespace(text) do
    @whitespace |> Regex.replace(text, " ") |> String.trim()
  end
end
