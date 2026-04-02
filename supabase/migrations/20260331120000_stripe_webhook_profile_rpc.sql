-- RPC used by /api/stripe/webhook to update profiles without PostgREST table resolution (PGRST205).

create or replace function public.stripe_webhook_set_profile_pro(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    is_pro = true,
    subscription_status = 'active',
    stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = coalesce(p_stripe_subscription_id, stripe_subscription_id),
    updated_at = now()
  where id = p_user_id;
end;
$$;

revoke all on function public.stripe_webhook_set_profile_pro(uuid, text, text) from public;
grant execute on function public.stripe_webhook_set_profile_pro(uuid, text, text) to service_role;
