-- Aircraft ratings are now derived from aircraft_types and stored as
-- "type:<type_key>". The old hardcoded keys map onto the types they named.
update public.licenses
set ratings = (
  select coalesce(array_agg(
    case r
      when 'cessna_152_rating'       then 'type:cessna_152'
      when 'cessna_172_rating'       then 'type:cessna_172'
      when 'tecnam_p2002jf_rating'   then 'type:tecnam_p2002jf'
      when 'tecnam_p_mentor_rating'  then 'type:tecnam_p_mentor'
      when 'tecnam_p2006t_rating'    then 'type:tecnam_p2006t'
      else r
    end
    order by ordinality
  ), '{}')
  from unnest(ratings) with ordinality as u(r, ordinality)
)
where ratings && array[
  'cessna_152_rating', 'cessna_172_rating', 'tecnam_p2002jf_rating',
  'tecnam_p_mentor_rating', 'tecnam_p2006t_rating'
];
