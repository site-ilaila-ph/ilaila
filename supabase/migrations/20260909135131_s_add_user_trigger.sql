create or replace function app.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into app.user_data (auth_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function app.handle_new_user();