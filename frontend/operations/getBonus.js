import { gql } from '@apollo/client';

export const GET_BONUS = gql`
  query BonusOffers {
    bonus {
      maximumActivations
      activatedCount
      offers {
        id
        title
        subtitle
        category
        discount
        imageUrl
        productCount
        isActivated
        ingredients {
          id
          name
        }
      }
    }
  }
`;

export const ACTIVATE_BONUS_OFFER = gql`
  mutation ActivateBonusOffer($offerId: String!) {
    activateBonusOffer(offerId: $offerId) {
      activatedCount
      offers {
        id
        isActivated
      }
    }
  }
`;
