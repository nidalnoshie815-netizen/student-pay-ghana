
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role public.app_role;
begin
  insert into public.profiles (id, full_name, phone, business_name, student_id, school)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'school'
  )
  on conflict (id) do nothing;

  begin
    chosen_role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'parent');
  exception when others then
    chosen_role := 'parent';
  end;

  -- Never allow self-assigning admin at signup.
  if chosen_role = 'admin' then
    chosen_role := 'parent';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, chosen_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
